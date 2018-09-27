# rust-bindgen-loader

A Webpack 4 loader to use bindgen'd Rust code from Javascript.

### Usage

You'll need Rust nightly setup with support for `wasm32-unknown-unknown`. Check out the (docs)[https://rustwasm.github.io/wasm-bindgen/whirlwind-tour/basic-usage.html] for more info.

Install from npm:
`npm i --save-dev rust-bindgen-loader`

Add to Webpack as a loader for `.rs` files:
```
{
    test: /\.rs$/,
    use: 'rust-bindgen-loader',
}
```

Configure a Rust project:
`cargo init --lib myCrate`

Add `wasm-bindgen` as a dependency of the crate (in `Cargo.toml`):
`wasm-bindgen = "0.2.22"`

Add something like the following to `lib.rs`:
```
extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

And add something like the following in Javascript:
```
import { wasmBooted, add } from './src/lib.rs';

wasmBooted.then(() => {
    console.log(add(1,2));
});
```

### Loader options

`release` (boolean) - Build the imported crate in release mode
`buildArgs` (array) - Additional arguments to pass to cargo during the build
