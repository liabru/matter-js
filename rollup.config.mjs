import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { execSync } from "child_process";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from '@rollup/plugin-terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

const minimize = process.env.MINIMIZE || false;
const kind = process.env.KIND || null;

const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
const version = !kind ? pkg.version : `${pkg.version}-${kind}+${commitHash}`;
const resolvePath = relativePath => path.resolve(__dirname, relativePath);
const license = fs.readFileSync(resolvePath("LICENSE"), "utf8");

const banner = `/*!
 * ${pkg.name} ${version} by @liabru
 * ${kind ? "Experimental pre-release build." : ""}
 * ${pkg.homepage}
 * License: ${pkg.license}
 *
${!minimize ? license.split("\n").map(l => ` * ${l}`).join("\n") : ""}
 */`;

const fileNameBase = `matter${kind ? '.' + kind : ''}${minimize ? '.min' : ''}.js`;
const outDir = resolvePath("build");

export default {
    input: "src/module/main.js",
    external: ["poly-decomp", "matter-wrap"],
    plugins: [
        resolve(),
        commonjs(),
        replace({
            preventAssignment: true,
            values: {
                __MATTER_VERSION__: JSON.stringify(version)
            }
        }),
        minimize ? terser() : null
    ].filter(Boolean),
    output: {
        file: path.join(outDir, fileNameBase),
        format: "umd",
        name: "Matter",
        globals: {
            "poly-decomp": "decomp",
            "matter-wrap": "MatterWrap"
        },
        banner,
        amd: { id: "matter" },
        sourcemap: false,
        intro: "var global = typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this);"
    }
};
