const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssertHtmlPlugin = require('add-asset-html-webpack-plugin');

const parentDir = path.resolve(__dirname, '..');
const distDir = path.resolve(parentDir, 'dist');
const dllManifest = require(`../dll/dll-manifest.json`);

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    filename: '[name].[hash:8].js',
    path: distDir,
    //chunkFilename: '[name].bundle.js'
  },
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
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10240//10KB
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 102400//100KB
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'demo',
      favicon: path.resolve(__dirname, 'favicon.ico'),
      inject: 'body',
      template: path.resolve(__dirname, 'template.html')
    }),
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor'
    // }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest'
    }),//这个可能没用呢
    // new webpack.ProvidePlugin({
    //   //_: 'lodash'//将lodash注册为全局变量_
    //   join: ['lodash', 'join']//也可以将指定的模块注入全局变量，便于 tree shaking
    // })
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: dllManifest
    }),
    new AddAssertHtmlPlugin({
      filepath: path.resolve(__dirname, '..', 'dll', '*.dll.js'),
      includeSourcemap: false
    })
  ],
  // externals: {
  //   qq: 'jQuery'
  // },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@': path.resolve(parentDir, 'src'),
      'vue$': 'vue/dist/vue.esm.js'
    }
  }
};
