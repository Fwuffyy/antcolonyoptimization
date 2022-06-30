// @ts-check

const path = require("path");
const webpack = require("webpack");

/** @type {webpack.Configuration}  */
const config = {
    mode: "development",
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts"],
        alias: {
            dat: path.resolve(__dirname, "node_modules/dat.gui/src")
        }
    },
    module: {
        rules: [
            {
                test: /.ts/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            }
        ]
    }
};

module.exports = config;