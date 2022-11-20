// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

const createConfig = require('./webpack.shared.cjs');

module.exports = [
    createConfig({
        content: './src/content.js',
        page: './src/page.js',
        inject: './src/inject.js'
    }, {}, true, 'chrome'),
    createConfig({
        background: './src/background.js',
        extension: './src/extension.js'
    }, [], true, 'chrome')
];