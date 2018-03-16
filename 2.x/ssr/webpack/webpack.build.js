const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const parentDir = path.resolve(__dirname, '..');
const distDir = path.resolve(parentDir, 'dist');

module.exports = {
  entry: {
    app: './src/main.js'
  },
  output: {
    filename: '[name].js',
    path: distDir
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
  ],
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  }
};
