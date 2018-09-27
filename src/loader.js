import loaderUtils from 'loader-utils';
import buildProjectForImport from './cargo';
import runBindgen from './bindgen';

export default function load(source) {
    let options = loaderUtils.getOptions(this);

    let wasmPath = buildProjectForImport(this.resourcePath, options);
    let jsPath = runBindgen(wasmPath);
    let jsRequest = loaderUtils.stringifyRequest(this, jsPath);

    return `module.exports.wasmBooted = import(${jsRequest}).then(wasmModule => {
        const keys = Object.keys(wasmModule);
        for (let key of keys) module.exports[key] = wasmModule[key];
    })`;
}
