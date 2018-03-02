const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
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
                sourceMap: true
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
                sourceMap: true
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
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'BundleAnalyzer.report.html'
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash:8].css'
    }),
    new CleanWebpackPlugin(
      [
        'dist/app.*',
        'dist/manifest.*'
      ],
      {
        root: parentDir,
        watch: true
      }
    )
  ]
});
