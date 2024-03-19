## @bitgreen/browser-wallet-base
___
Extension base structure.  Includes base files for extension as well as the capacitorjs hybrid app project.

## Scripts
Normally all scripts are run from the main project, but you can also run them manually here:

### `npm run setup`
This sets up the capacitorjs android and iOS platforms and generates the app icons.  Platform code is in the form of Android Studio and XCode projects, respectively, in `../../build/android` and `../../build/ios`

### `npm run icons`
Generates app icons and puts them in the platform build folders.

### `npm run icons:android`
Generates android app icons and puts them in the android platform build folder.

### `npm run icons:ios`
Generates iOS app icons and puts them in the iOS platform build folder.

### `npm run build`
Sync the compiled app code into the platform folders.  Compiled app code is generated from the main project and is located in `../../build/app`

### `npm run build:android`
Sync the compiled app code into the android platform folder.

### `npm run build:ios`
Sync the compiled app code into the iOS platform folder.

## Webpack
There is a webpack config for each target (chrome, firefox and safari browser extension plus android and iOS apps), and are generated using `webpack.shared.cjs`.  Some things to note about the webpack build proccess are:
- destination folder is removed before compilation
- when `--mode=development`, a watchdog is automatically started and all JS and SCSS files have inline sourcemaps for easier debugging
- the android and iOS platform folders will be re-synced upon every build, including in development mode

## Versioning
Whenever a new version is ready to be built for the various app stores, there are a few things that need to be done:
0. ideally you've already created a new branch withe the new version
1. update the version number in ALL package.json files
2. update the version number all the manifest-xxx.json files
3. update the version number in the `build` scripts in this package's package.json file `capacitor-set-version -v x.x.x`
4. update the build number in that same file `capacitor-set-version -b x`.  Just increase the number by one.  But it MUST be done for every new version that gets uploaded to the app stores - even if the version number stays the same