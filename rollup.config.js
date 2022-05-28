import { defineConfig } from "rollup"
import esbuild from "rollup-plugin-esbuild"
import serve from "rollup-plugin-serve"
import livereload from "rollup-plugin-livereload"
import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import cjs from "@rollup/plugin-commonjs"
import postcss from "rollup-plugin-postcss"
// TODO 打包 less

const devPlugins =
    process.env.NODE_ENV === "development"
        ? [
              serve({
                  contentBase: "demo",
                  port: 8080,
              }),
              livereload("demo"),
          ]
        : []

export default defineConfig({
    input: "src/index.ts",
    // external: ["punycode"],
    output: [
        {
            file: "dist/index.mjs",
            format: "esm",
        },
        {
            file: "dist/index.js",
            format: "cjs",
        },
    ],
    plugins: [
        postcss({
            extract: "markmax.css",
            extensions: [".less", ".css"],
        }),
        json(),
        cjs({
            include: ["node_modules/**"],
        }),
        resolve({
            preferBuiltins: false,
        }),
        esbuild({
            include: ["src/**/*.ts"],
            exclude: /node_modules/,
            loaders: {
                ".json": "json",
            },
            treeShaking: true,
        }),

        ...devPlugins,
    ],
})
