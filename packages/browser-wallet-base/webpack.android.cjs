const createConfig = require('./webpack.shared.cjs');

module.exports = [
    createConfig({
        app: './src/app.js'
    }, [], true, 'android')
];