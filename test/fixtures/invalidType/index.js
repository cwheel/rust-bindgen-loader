import { wasmBooted, add } from './src/lib.rs';

wasmBooted.then(() => {
    console.log(add(1,2));
});
