#!/bin/sh

mkdir -p dist && rm dist/*.zip
npm install
npm run build
cd build/platforms/chrome/
zip -r ../../dist/chrome.zip .
cd ../firefox/
zip -r ../../dist/firefox.zip .
cd ../apple/
zip -r ../../dist/apple.zip .

## TODO Create a zip file of relevant source.