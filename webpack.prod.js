const webpack = require('webpack');
const configs = require('./webpack.config.js');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

configs.entry = {
  'handWrite': './index.js'
}

module.exports = merge(configs, {
  devtool: 'cheap-module-source-map',
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
})
