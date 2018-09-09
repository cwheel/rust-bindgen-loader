const path = require('path');

module.exports = {
    target: 'node',
    entry: {
        loader: path.resolve(__dirname, 'src/loader.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
};
