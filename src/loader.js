import { buildProjectForImport } from './cargo';

export default function load(source) {
    buildProjectForImport(this.resourcePath);
}
