var webpack = require('webpack');

module.exports = {
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    port: 8080
  },

  // 配置入口
  entry: {
    page: __dirname +'/client/page',
  },
  output: {
    path: __dirname + '/pubic/dist',
    publicPath: 'dist',
    filename: 'page.js',
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader'},
      {
        test: /\.js[x]?$/,
        exclude: /node_modules/, loader: 'babel-loader'
      },
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }
    ]
  },
  resolve: {
    extensions: [' ', '.js', '.jsx'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
