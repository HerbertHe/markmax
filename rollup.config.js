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
    input: { index: "src/index.ts", plugin: "src/plugins/index.ts" },
    output: [
        {
            dir: "dist",
            format: "esm",
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
            format: "esm",
            minify: process.env.NODE_ENV !== "development",
            loaders: {
                ".json": "json",
            },
            treeShaking: true,
        }),

        ...devPlugins,
    ],
})
