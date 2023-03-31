const path = require("path");
const webpack = require('webpack');

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  externals: {
    fs: 'browserify-fs',
    net: 'net-browserify'
  },
  module: {
    rules: [
      // ... other rules
      {
        test: /\.js$/, // Target all .js files
        exclude: /node_modules/, // Exclude the node_modules folder
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
