import { buildProjectForImport } from './cargo';

export default function load(source) {
    let jsRequest = buildProjectForImport.bind(this)(this.resourcePath);

    return `module.exports.wasmBooted = import(${jsRequest}).then(wasmModule => {
      const keys = Object.keys(wasmModule);
      for (let key of keys) module.exports[key] = wasmModule[key];
    })`;
}
