const path = require("path");

class MyPlugin {
  apply(compiler) {
    var allData = "";

    // inject a function to loaderContext so loaders can pass back info
    compiler.hooks.compilation.tap("MyPlugin", compilation => {
      console.log("COMPILATION");

      compilation.hooks.normalModuleLoader.tap(
        "MyPlugin",
        (loaderContext, module) => {
          loaderContext.myExportFn = data => {
            allData += data + "\n";
          };
        }
      );
    });

    // at the end, generate an asset using the data
    compiler.hooks.emit.tapAsync("MyPlugin", (compilation, callback) => {
      compilation.assets["myfile.js"] = {
        source: () => allData,
        size: () => allData.length
      };
      callback();
    });
  }
}

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

  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "loaders")]
  },

  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        use: [path.resolve("./loaders/my-loader.js"), "ts-loader"]
      }
    ]
  },

  plugins: [new MyPlugin()]
};
