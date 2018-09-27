import path from 'path';
import webpack from 'webpack';

function buildProject(project, options = {}) {
    const compiler = webpack({
        target: 'node',
        mode: 'production',
        entry: `./${project}/index.js`,
        context: path.resolve(__dirname, 'fixtures'),
        output: {
            path: path.resolve(__dirname, '../test_dist')
        },
        module: {
            rules: [
                {
                    test: /\.rs$/,
                    use: {
                        loader: path.resolve(__dirname, '../src/loader.js'),
                        options
                    },
                }
            ]
        }
    });

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) reject(err);
            resolve(stats);
        });
    });
}

test('loads a basic Rust library', async () => {
    const webpackResult = await buildProject('basic');
    expect(webpackResult.compilation.errors).toEqual([]);
}, 2000);

test('loads a basic Rust library in release mode', async () => {
    const webpackResult = await buildProject('basic', { release: true });
    expect(webpackResult.compilation.errors).toEqual([]);
});

test('captures a compiler error from Rust', async () => {
    const webpackResult = await buildProject('broken');
    const error = webpackResult.compilation.errors[0].error.toString();

    expect(error).toEqual(expect.stringContaining('error[E0425]'));
    expect(error).toEqual(expect.stringContaining('a + b + c'));
});

test('validates the crate type', async () => {
    const webpackResult = await buildProject('invalidType');
    const error = webpackResult.compilation.errors[0].error.toString();

    expect(error).toEqual('Error: Cargo project must have crate-type of `cdylib`');
});

test('ensures the crate depends on wasm-bindgen', async () => {
    const webpackResult = await buildProject('invalidDeps');
    const error = webpackResult.compilation.errors[0].error.toString();

    expect(error).toEqual('Error: Cargo project must list `wasm-bindgen` as a dependency');
});
