import { defineConfig } from "eslint/config";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("eslint:recommended"),

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
            ...globals.jquery,
            ...globals.amd,
            Matter: false,
            window: true,
            document: false,
            Element: false,
            MatterTools: false,
            phantom: false,
            process: false,
            HTMLElement: false,
            require: false,
            $: false,
            Image: false,
            navigator: false,
            setTimeout: false,
            decomp: false,
            module: false,
            Body: false,
            Composite: false,
            World: false,
            Contact: false,
            Detector: false,
            Grid: false,
            Pairs: false,
            Pair: false,
            Resolver: false,
            SAT: false,
            Constraint: false,
            MouseConstraint: false,
            Common: false,
            Engine: false,
            Mouse: false,
            Sleeping: false,
            Bodies: false,
            Composites: false,
            Axes: false,
            Bounds: false,
            Vector: false,
            Vertices: false,
            Render: false,
            Events: false,
            Query: false,
            Runner: false,
            Svg: false,
            Example: false,
            __MATTER_VERSION__: false,
            __MATTER_IS_DEV__: false,
            jest: false,
            test: false,
            expect: false,
            describe: false,
        },
    },

    rules: {
        "no-fallthrough": 2,
        "no-console": 0,
        "no-unused-vars": 0,
        "no-redeclare": 0,
        indent: [2, 4],
        semi: [2, "always"],
    },
}]);