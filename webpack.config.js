const path = require('path');
const webpack = require('webpack');

const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = (env, argv) => ({
  entry: {
    main: path.resolve('./src/index.ts'),
  },

  //...
  devServer: {
    port: 4297,
    overlay: {
      warnings: true,
      errors: true,
    },
  },

  output: {
    filename: 'bundle.js',
    publicPath: '',
    path: path.resolve(__dirname, 'dist'),
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    /* For resolving TS settings to the correct .tsconfig */
    plugins: [new TsconfigPathsPlugin({})],
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
        loader: 'ts-loader',
      },
      /** typescript font files */
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
    ],
  },

  /* for loading the monaco editor */
  plugins: [
    new MonacoWebpackPlugin(),
    new webpack.DefinePlugin({
      'GLOBAL_CONFIG.mode': JSON.stringify(env.NODE_ENV),
    }),
  ],
});
