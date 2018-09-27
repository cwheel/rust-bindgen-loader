import path from 'path';
import { spawnSync } from 'child_process';

export default function runBindgen(wasmPath) {
    let buildProc = spawnSync('wasm-bindgen', [wasmPath, '--out-dir', path.dirname(wasmPath)]);
    return `${path.dirname(wasmPath)}/${path.basename(wasmPath, 'wasm')}js`;
}
