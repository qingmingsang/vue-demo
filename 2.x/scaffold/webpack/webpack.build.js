const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const poststylus = require('poststylus');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const common = require('./webpack.common.js');
const autoprefixerConfig = { browsers: 'last 10 versions' };
const parentDir = path.resolve(__dirname, '..');

module.exports = merge(common, {
  module: {
    rules: [
      {
        test: /\.styl$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true
              }
            },
            {
              loader: 'stylus-loader',
              options: {
                use: [poststylus([require('autoprefixer')(autoprefixerConfig)])]
              }
            }
          ]
        })
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                minimize: true,
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')(autoprefixerConfig)
                ]
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new UglifyJSPlugin(),
    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css'
    }),
    new CleanWebpackPlugin(
      ['dist/*'],
      { root: parentDir }
    )
  ]
});
