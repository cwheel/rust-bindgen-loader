import fs from 'fs';
import toml from 'toml';
import { spawnSync } from 'child_process';

export default function buildProjectForImport(path, options) {
    let projectRoot = resolveProjectRoot(path);
    let validationResult = validateCargoProject(projectRoot);

    if (validationResult instanceof Error) {
        throw validationResult;
    }

    let buildResults = runCargoBuild(
        projectRoot,
        options.release || true,
        options.buildArgs || []
    );

    if (buildResults.error instanceof Error) {
        throw buildResults.error;
    }

    return buildResults.wasmPath;
}

function cargoManifestForRoot(projectRoot) {
    return `${projectRoot}/cargo.toml`;
}

function resolveProjectRoot(path) {
    let parents = path.split('/');
    let projectRoot;

    while (parents.length > 0) {
        parents.pop();

        let path = parents.join('/');
        let manifestPath = cargoManifestForRoot(path);

        if (fs.existsSync(manifestPath)) {
            projectRoot = path;
            break;
        }
    }

    return projectRoot;
}

function validateCargoProject(projectRoot) {
    let manifestPath = cargoManifestForRoot(projectRoot);
    let manifestToml = fs.readFileSync(manifestPath);
    let manifest = toml.parse(manifestToml);

    if (!(manifest.lib && manifest.lib['crate-type'][0] === 'cdylib')) {
        return new Error('Cargo project must have crate-type of `cdylib`');
    }

    if (!(manifest.dependencies && manifest.dependencies['wasm-bindgen'])) {
        return new Error('Cargo project must list `wasm-bindgen` as a dependency');
    }
}

function runCargoBuild(cwd, release, userBuildArgs) {
    let buildArgs = ['+nightly', 'build', '--target', 'wasm32-unknown-unknown', '--message-format', 'json'];
    buildArgs.concat(userBuildArgs);

    if (release) buildArgs.push('--release');

    let buildProc = spawnSync('cargo', buildArgs, { cwd });
    let buildError = buildProc.stderr.toString().trim();
    let buildResults = parseCargoResults(buildProc.stdout.toString());
    let compilerOutput = '';
    let buildOutputFile;

    for (let result of buildResults) {
        if (result.filenames && ~result.filenames[0].indexOf('.wasm')) {
            buildOutputFile = result.filenames[0];
        }

        if (result.message && result.reason === 'compiler-message') {
            compilerOutput += result.message.rendered;
        }
    }

    return {
        'wasmPath': buildOutputFile,
        'error': ~buildError.indexOf('error') ? new Error(compilerOutput) : undefined,
    };
}

function parseCargoResults(results) {
    return results.split('\n').slice(0, -1).map(line => {
        return JSON.parse(line)
    });
}
