const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const parentDir = path.resolve(__dirname, '..');
const dllDir = path.resolve(parentDir, 'dll');

module.exports = {
  entry: {
    dll: ['vue']
  },
  output: {
    path: dllDir,
    filename: '[name]_[hash:8].dll.js',
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(dllDir, '[name]-manifest.json'),
      name: '[name]',
      context: __dirname
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'DllAnalyzer.report.html'
    }),
    new CleanWebpackPlugin(
      ['dll/*'],
      { root: parentDir }
    ),
    new UglifyJSPlugin()
  ]
};
