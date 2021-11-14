# Polkadot.js for Browser
Polkadot.js is not available ready to use in a browser.
We have to convert it using "browserify" and then minimize to reduce the huge size.

## Installation
npm init
npm install @polkadot/api
npm install @polkadot/util
npm install @polkadot/util-crypto
npm install @polkadot/keyring
npm install esmify
npm install browser-resolve
npm install uglify-js -g
npm install -g browserify

## Generation of the library
browserify dependencies.js -p esmify > polkadot.js
uglifyjs polkadot.js > ../chrome-plugin/polkadot-6.8.1/polkadot.min.js
