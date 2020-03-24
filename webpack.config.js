const path = require("path");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: {
    main: path.resolve("./src/index.ts")
  },

  //...
  devServer: {
    port: 4297,
    overlay: {
      warnings: true,
      errors: true
    }
  },

  output: {
    filename: "bundle.js",
    publicPath: "/assets/",
    path: path.resolve(__dirname, "dist")
  },

  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    plugins: [new TsconfigPathsPlugin({})]
  },

  module: {
    rules: [
      // CSS loading
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },

      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },

};
