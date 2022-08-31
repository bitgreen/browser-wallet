#!/bin/bash
mkdir safari-extension/javascript
cp -r extension/* safari-extension/javascript/
mv safari-extension/javascript/manifest-safari.json safari-extension/javascript/manifest.json
