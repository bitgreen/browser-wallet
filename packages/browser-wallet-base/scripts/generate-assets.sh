#!/bin/bash
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --target*)
      if [[ $key == "--target="* ]]; then
        target="${key#*=}"
      else
        target="$2"
        shift
      fi
      ;;
    *)
      echo "Unknown option: $key"
      exit 1
      ;;
  esac
  shift
done

if [[ "$target" == "ios" ]]; then
  path=../../build/platforms/ios/App
else
  path=../../build/platforms/${target}
fi

npx capacitor-assets generate --iconBackgroundColor \#224851 --iconBackgroundColorDark \#224851 --splashBackgroundColor \#224851 --splashBackgroundColorDark \#224851 --${target} --assetPath src/app-resources --${target}Project ${path}