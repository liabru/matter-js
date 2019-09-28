/* eslint-env es6 */
"use strict";

const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const execSync = require('child_process').execSync;

module.exports = (env = {}) => {
    const minimize = env.MINIMIZE || false;
    const edge = env.EDGE || false;
    const maxSize = minimize ? 100 * 1024 : 512 * 1024;

    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const version = !edge ? pkg.version : `${pkg.version}-alpha-${commitHash}`;
    const date = new Date().toISOString().slice(0, 10);
    const name = 'matter-examples';
    const banner = `${name} ${version} by @liabru ${date}
    ${pkg.homepage}
    License ${pkg.license}`;

    return {
        entry: './examples/index.js',
        output: {
            library: 'Example',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            globalObject: 'this',
            path: path.resolve(__dirname, './demo/js'),
            filename: `Examples${minimize ? '.min' : ''}.js`
        },
        node: false,
        optimization: { minimize },
        performance: {
            maxEntrypointSize: maxSize,
            maxAssetSize: maxSize
        },
        plugins: [
            new webpack.BannerPlugin(banner)
        ],
        externals: {
            'matter-js': {
                commonjs: 'matter-js',
                commonjs2: 'matter-js',
                amd: 'matter-js',
                root: 'Matter'
            }
        }
    };
};
