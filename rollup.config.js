import { defineConfig } from "rollup"
import esbuild from "rollup-plugin-esbuild"
import serve from "rollup-plugin-serve"
import livereload from "rollup-plugin-livereload"
import json from "@rollup/plugin-json"
import resolve from "@rollup/plugin-node-resolve"
import cjs from "@rollup/plugin-commonjs"

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
        }),

        ...devPlugins,
    ],
})
