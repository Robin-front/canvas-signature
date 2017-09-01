const path = require('path');

module.exports = {
  entry: {
    demo: './example/demo.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    library: 'handWrite'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ],
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './example',
    host: '127.0.0.1'
  }
}
