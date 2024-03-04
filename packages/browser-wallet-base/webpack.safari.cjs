const createConfig = require('./webpack.shared.cjs');

module.exports = [
  createConfig({
    background: './src/background.js',
    content: './src/content.js',
    page: './src/page.js',
    inject: './src/inject.js'
  }, {}, false, 'safari'),
  createConfig({
    extension: './src/extension.js'
  }, [], true, 'safari')
];