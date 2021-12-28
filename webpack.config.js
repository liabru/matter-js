/* eslint-env es6 */
"use strict";

const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports = (env = {}) => {
    const minimize = env.MINIMIZE || false;
    const kind = env.KIND || null;
    const sizeThreshold = minimize ? 100 * 1024 : 512 * 1024;

    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const version = !kind ? pkg.version : `${pkg.version}-${kind}+${commitHash}`;
    const license = fs.readFileSync('LICENSE', 'utf8');
    const resolve = relativePath => path.resolve(__dirname, relativePath);
    
    const banner = 
`${pkg.name} ${version} by @liabru
${kind ? 'Experimental pre-release build.\n  ' : ''}${pkg.homepage}
License ${pkg.license}${!minimize ? '\n\n' + license : ''}`;

    return {
        entry: { 'matter': './src/module/main.js' },
        node: false,
        output: {
            library: 'Matter',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            globalObject: 'this',
            path: resolve('./build'),
            filename: `[name]${kind ? '.' + kind : ''}${minimize ? '.min' : ''}.js`
        },
        optimization: { minimize },
        performance: {
            maxEntrypointSize: sizeThreshold,
            maxAssetSize: sizeThreshold
        },
        plugins: [
            new webpack.BannerPlugin(banner),
            new webpack.DefinePlugin({
                __MATTER_VERSION__: JSON.stringify(version),
            })
        ],
        externals: {
            'poly-decomp': {
                commonjs: 'poly-decomp',
                commonjs2: 'poly-decomp',
                amd: 'poly-decomp',
                root: 'decomp'
            },
            'matter-wrap': {
                commonjs: 'matter-wrap',
                commonjs2: 'matter-wrap',
                amd: 'matter-wrap',
                root: 'MatterWrap'
            }
        }
    };
};
