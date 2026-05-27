import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const dev = process.env.ROLLUP_WATCH === 'true' || process.env.NODE_ENV === 'development';
const name = 'matter-demo.bundle';
const outDir = path.resolve(__dirname, (dev ? 'build' : 'demo'));
const devPath = './src/module/main.js';

const banner = `/*! 
* ${name} ${pkg.version} by @liabru
* ${pkg.homepage}
* License ${pkg.license}
*/`;

export default {
  input: { [name]: 'demo/src/index.js' },
  watch: {
    chokidar: {
      usePolling: true
    }
  },
  output: {
    dir: outDir,
    format: 'umd',
    name: 'MatterDemo',
    sourcemap: dev,
    banner,
    globals: {
      'matter-js': 'Matter',
      'MatterDev': 'Matter',
      'MatterBuild': 'Matter'
    },
  },
  plugins: [
    alias({
      entries: [
        { find: 'matter-js', replacement: path.resolve(__dirname, devPath) },
        { find: 'MatterDev', replacement: path.resolve(__dirname, devPath) },
        { find: 'MatterBuild', replacement: path.resolve(__dirname, devPath) }
      ]
    }),
    replace({
      preventAssignment: true,
      values: {
        __MATTER_VERSION__: JSON.stringify('*'),
        __MATTER_IS_DEV__: JSON.stringify(dev)
      }
    }),
    resolve({ browser: true }),
    commonjs(),
    !dev && terser({
      mangle: true,
      format: {
        comments: function (node, comment) {
          if (comment.type === 'comment2') {
            return /(^\!|@license|@preserve|license)/i.test(comment.value);
          }
          return false;
        }
      }
    }),
    dev && livereload({
      watch: ['build', 'demo'],
      usePolling: true,
    }),
    dev && serve({ contentBase: ['build', 'demo'], port: 8080 }),
  ].filter(Boolean),
};
