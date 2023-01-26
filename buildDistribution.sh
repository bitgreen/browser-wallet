#!/bin/sh

mkdir -p dist && rm dist/*.zip
npm run install
npm run build
cd build/chrome/
zip -r ../../dist/chrome.zip .
cd ../firefox/
zip -r ../../dist/firefox.zip .
cd ../safari/
zip -r ../../dist/safari.zip .

## TODO Create a zip file of relevant source.