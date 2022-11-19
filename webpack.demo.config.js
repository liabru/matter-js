/* eslint-env es6 */
"use strict";

const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env = {}) => {
    const version = pkg.version;
    const analyze = env.ANALYZE || false;
    const devServer = Boolean(process.env.WEBPACK_DEV_SERVER);
    const minimize = !devServer;
    const sizeThreshold = 600 * 1024;

    const publicPath = devServer ? '/' : './js';
    const devPath = './src/module/main.js';
    const buildPath = './build/matter.js';
    const resolve = relativePath => path.resolve(__dirname, relativePath);
    
    const name = 'matter-demo';
    const banner = 
`${name} bundle ${version} by @liabru
${pkg.homepage}
License ${pkg.license}`;

    return {
        entry: { [name]: './demo/src/index.js' },
        node: false,
        devtool: devServer ? false : 'none',
        output: {
            library: 'MatterDemo',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            globalObject: 'this',
            publicPath,
            path: resolve('./demo/js'),
            filename: `[name].[contenthash:6]${minimize ? '.min' : ''}.js`
        },
        resolve: {
            alias:{
                'matter-js': resolve(devPath),
                'MatterDev': resolve(devPath),
                'MatterBuild': resolve(
                    devServer ? buildPath : devPath
                )
            }
        },
        optimization: {
            minimize,
            minimizer: [new TerserPlugin({ extractComments: false })],
            moduleIds: 'hashed',
            runtimeChunk: { name: `${name}.main` },
            splitChunks: {
                automaticNameDelimiter: '.',
                cacheGroups: {
                    default: false,
                    vendors: false,
                    vendor: {
                        chunks: 'all',
                        enforce: true,
                        test: /[\\/]node_modules[\\/]/,
                        name: module => {
                            if (devServer) {
                                return `${name}.vendor`;
                            }
                            const parser = /[\\/]node_modules[\\/](.*?)([\\/]|$)/;
                            const moduleName = module.context.match(parser)[1];
                            return `${name}.${moduleName.replace('@', '')}`;
                        }
                    },
                },
            },
        },
        performance: {
            maxEntrypointSize: sizeThreshold,
            maxAssetSize: sizeThreshold
        },
        plugins: [
            new webpack.BannerPlugin(banner),
            new webpack.DefinePlugin({
                __MATTER_VERSION__: JSON.stringify('*'),
                __MATTER_IS_DEV__: devServer
            }),
            new HtmlWebpackPlugin({
                template: resolve('./demo/src/index.ejs'),
                filename: devServer ? 'index.html' 
                    : resolve('./demo/index.html'),
                inject: false,
                minify: false,
                publicPath
            })
        ].concat(analyze ? [new BundleAnalyzerPlugin({
            openAnalyzer: true
        })] : []),
        devServer: {
            contentBase: [resolve('./demo')],
            watchContentBase: true,
            hot: false,
            compress: true,
            overlay: true,
            port: 8000
        }
    };
};
