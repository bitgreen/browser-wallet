const createConfig = require('./webpack.shared.cjs');

module.exports = [
  createConfig({
    background: './src/background.js',
    content: './src/content.js',
    page: './src/page.js'
  }, {}, false, 'firefox'),
  createConfig({
    extension: './src/extension.js'
  }, [], true, 'firefox')
];