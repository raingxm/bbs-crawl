var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  // 配置入口
  entry: {
    page: __dirname +'/client/page',
  },
  output: {
    path: __dirname + '/public/dist/',
    publicPath: 'dist',
    filename: 'page.js',
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract('css-loader')},
      { test: /\.js[x]?$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.less$/, loader: ExtractTextPlugin.extract('css-loader!less-loader') }
    ]
  },
  resolve: {
    extensions: [' ', '.js', '.jsx'],
  },
  plugins: [
    new ExtractTextPlugin('page.css'),
    new webpack.HotModuleReplacementPlugin()
  ]
};
