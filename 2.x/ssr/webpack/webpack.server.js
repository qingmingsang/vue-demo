const path = require('path');
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const baseConfig = require('./webpack.base.config.js')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const VueSSRPlugin = require('vue-ssr-webpack-plugin');

module.exports = {
  // 将 entry 指向应用程序的 server entry 文件
  entry: {
    server: './src/main-server.js'
  },
  // 这允许 webpack 以 Node 适用方式(Node-appropriate fashion)处理动态导入(dynamic import)，
  // 并且还会在编译 Vue 组件时，
  // 告知 `vue-loader` 输送面向服务器代码(server-oriented code)。
  target: 'node',
  // 对 bundle renderer 提供 source map 支持
  // 此处告知 server bundle 使用 Node 风格导出模块(Node-style exports)
  output: {
    filename: '[name].bundle.js',
    //chunkFilename: '[name].[chunkhash:8].js',
    path: path.resolve(__dirname, '../dist/server'),
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new VueSSRServerPlugin(),
    // new VueSSRPlugin({
    //   filename: 'vue-ssr-server-bundle.json'
    // }),
    new CleanWebpackPlugin(
      ['*'],
      { root: path.resolve(__dirname, '../dist/server') }
    ),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.VUE_ENV': '"server"'
    })
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        exclude: /node_modules/,
        use: {
          loader: 'vue-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
    ]
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  externals: {
    //'node-fetch': 'fetch'
  }
}