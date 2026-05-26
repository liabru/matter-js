import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const dev = process.env.ROLLUP_WATCH === 'true' || process.env.NODE_ENV === 'development';
const name = 'matter-demo';
const outDir = path.resolve(__dirname, 'demo/js');
const devPath = './src/module/main.js';
const devServer = true;

export default {
  input: { [name]: 'demo/src/index.js' },
  plugins: [
    alias({
      entries: [
        { find: 'matter-js',  replacement: path.resolve(__dirname, devPath) },
        { find: 'MatterDev',  replacement: path.resolve(__dirname, devPath) },
        { find: 'MatterBuild', replacement: path.resolve(__dirname, devPath) }
      ]
    }),
    replace({
      preventAssignment: true,
      values: {
        __MATTER_VERSION__: JSON.stringify('*'),
        __MATTER_IS_DEV__: JSON.stringify(devServer)
      }
    }),
    resolve({ browser: true }),
    commonjs(),
    dev && serve({ contentBase: 'demo', port: 8080 }),
    dev && livereload({
      watch: ['demo/src', 'demo/index.html'],
      verbose: false
    })
  ].filter(Boolean),
  watch: {
    exclude: ['demo/js/**', 'demo/js/**/lost+found']
  },
  output: {
    dir: outDir,
    format: 'umd',
    name: 'MatterDemo',
    entryFileNames: dev ? '[name].js' : '[name].[hash].js',
    chunkFileNames: dev ? '[name].js' : '[name].[hash].js',
    sourcemap: dev,
    banner: `// matter-demo bundle ${pkg.version} by @liabru\n// ${pkg.homepage}\n// License ${pkg.license}`,
    globals: {
      'matter-js': 'Matter',
      'MatterDev': 'Matter',
      'MatterBuild': 'Matter'
    },
  },
};
