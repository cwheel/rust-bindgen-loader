import fs from 'fs';
import toml from 'toml';
import path from 'path';
import loaderUtils from 'loader-utils';
import { spawnSync } from 'child_process';

export function buildProjectForImport(path) {
    let projectRoot = resolveProjectRoot(path);
    let projectInvalid = cargoProjectIsInvalid(projectRoot);

    if (projectInvalid) {
        throw new Error(projectInvalid);
    }

    let buildResults = runCargoBuild();

    if (buildResults.error) {
        throw new Error(buildResults.error);
    }

    let jsLoader = runBindgenBuild(buildResults.wasmPath);

    console.log('loader', jsLoader)

    return loaderUtils.stringifyRequest(this, jsLoader);
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

function cargoProjectIsInvalid(projectRoot) {
    let manifestPath = cargoManifestForRoot(projectRoot);
    let manifestToml = fs.readFileSync(manifestPath);
    let manifest = toml.parse(manifestToml);

    if (!(manifest.lib && manifest.lib['crate-type'][0] === 'cdylib')) {
        return 'Cargo project must have crate-type of `cdylib`';
    }

    if (!(manifest.dependencies && manifest.dependencies['wasm-bindgen'])) {
        return 'Cargo project must list wasm-bindgen as a dependency';
    }
}

function runCargoBuild() {
    let buildProc = spawnSync('cargo', ['+nightly', 'build', '--target', 'wasm32-unknown-unknown', '--message-format', 'json']);
    let buildError = buildProc.stderr.toString().trim();
    let buildResults = parseCargoResults(buildProc.stdout.toString());
    let buildOutput;

    for (let result of buildResults) {
        if (result.filenames && ~result.filenames[0].indexOf('.wasm')) {
            buildOutput = result.filenames[0];
        }
    }

    return {
        'wasmPath': buildOutput,
        'error': ~buildError.indexOf('error') ? buildError : '',
    };
}

function runBindgenBuild(wasmPath) {
    let buildProc = spawnSync('wasm-bindgen', [wasmPath, '--out-dir', path.dirname(wasmPath)]);

    return `${path.dirname(wasmPath)}/${path.basename(wasmPath, 'wasm')}js`;
}

function parseCargoResults(results) {
    return results.split('\n').slice(0, -1).map(line => {
        return JSON.parse(line)
    });
}
