const path = require("path");

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
    extensions: [".ts", ".tsx", ".js", ".json"]
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
        loader: "ts-loader",
        options: {
          // make sure not to set `transpileOnly: true` here, otherwise it will not work
          getCustomTransformers: path.resolve(__dirname, "transformer.js")
        }
      }
    ]
  }
};
