/* eslint-env es6 */
"use strict";

const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports = (env = {}) => {
    const minimize = env.MINIMIZE || false;
    const alpha = env.ALPHA || false;
    const maxSize = minimize ? 100 * 1024 : 512 * 1024;
    const isDevServer = process.env.WEBPACK_DEV_SERVER;

    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    const version = !alpha ? pkg.version : `${pkg.version}-alpha+${commitHash}`;
    const license = fs.readFileSync('LICENSE', 'utf8');
    const date = new Date().toISOString().slice(0, 10);
    const name = 'matter';
    const alphaInfo = 'Experimental pre-release build.\n  ';
    const banner = 
`${pkg.name} ${version} by @liabru ${date}
${alpha ? alphaInfo : ''}${pkg.homepage}
License ${pkg.license}${!minimize ? '\n\n' + license : ''}`;

    const entry = isDevServer ? './demo/js/Server.js' : './src/module/main.js';

    const externals = isDevServer ? 
        {
            'matter-js': {
                commonjs: 'matter-js',
                commonjs2: 'matter-js',
                amd: 'matter-js',
                root: 'Matter'
            }
        } : 
        {
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
        };

    return {
        entry: { [name]: entry },
        output: {
            library: 'Matter',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            globalObject: 'this',
            path: path.resolve(__dirname, './build'),
            filename: `[name]${alpha ? '.alpha' : ''}${minimize ? '.min' : ''}.js`
        },
        node: false,
        optimization: { minimize },
        performance: {
            maxEntrypointSize: maxSize,
            maxAssetSize: maxSize
        },
        plugins: [
            new webpack.BannerPlugin(banner),
            new webpack.DefinePlugin({
                __MATTER_VERSION__: JSON.stringify(!isDevServer ? version : '*'),
            })
        ],
        externals,
        devServer: {
            contentBase: [
                path.resolve(__dirname, './demo'),
                path.resolve(__dirname, './examples'),
                path.resolve(__dirname, './node_modules/matter-tools/build'),
                path.resolve(__dirname, './node_modules/pathseg'),
                path.resolve(__dirname, './node_modules/matter-wrap/build')
            ],
            watchContentBase: true,
            open: true,
            openPage: '',
            compress: true,
            overlay: true,
            port: 8000,
            proxy: {
                '/build': {
                    target: 'http://localhost:8000/',
                    pathRewrite: { '^/build' : '/' }
                },
                '/examples': {
                    target: 'http://localhost:8000/',
                    pathRewrite: { '^/examples' : '/' }
                },
                '/lib/matter-tools.demo.js': {
                    target: 'http://localhost:8000/',
                    pathRewrite: { '^/lib/matter-tools.demo.js' : '/matter-tools.demo.js' }
                },
                '/lib/matter-tools.inspector.js': {
                    target: 'http://localhost:8000/',
                    pathRewrite: { '^/lib/matter-tools.inspector.js' : '/matter-tools.inspector.js' }
                },
                '/lib/matter-tools.gui.js': {
                    target: 'http://localhost:8000/',
                    pathRewrite: { '^/lib/matter-tools.gui.js' : '/matter-tools.gui.js' }
                },
                '/lib/pathseg.js': {
                    target: 'http://localhost:8000/',
                    pathRewrite: { '^/lib/pathseg.js' : '/pathseg.js' }
                },
                '/lib/matter-wrap.js': {
                    target: 'http://localhost:8000/',
                    pathRewrite: { '^/lib/matter-wrap.js' : '/matter-wrap.js' }
                }
            }
        }
    };
};
