const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const assets = ['static/main']
const copyPlugins = new CopyWebpackPlugin({
  patterns: assets.map((asset) => ({
    from: path.resolve(__dirname, 'src', asset),
    to: path.resolve(__dirname, '.webpack/main', asset)
  }))
})
module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  plugins: [
    copyPlugins
  ]
};
