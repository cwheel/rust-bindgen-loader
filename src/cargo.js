import fs from 'fs';
import toml from 'toml';

export function buildProjectForImport(path) {
    let projectRoot = resolveProjectRoot(path);
    let projectInvalid = cargoProjectIsInvalid(projectRoot);

    if (projectInvalid) {
        throw new Error(projectInvalid);
    }
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
