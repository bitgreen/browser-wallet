import fs from 'fs';
import xml2js from 'xml2js';

const stylesPath = '../../build/platforms/android/app/src/main/res/values/styles.xml'
fs.readFile(stylesPath, 'utf-8', (err, data) => {
  // Parse XML data
  xml2js.parseString(data, (err, result) => {
    // Modify AppTheme.NoActionBar style
    modifyStyle(result.resources.style, 'AppTheme.NoActionBar', '@drawable/gradient');

    // Modify AppTheme.NoActionBarLaunch style
    modifyStyle(result.resources.style, 'AppTheme.NoActionBarLaunch', '@layout/splash');

    // Convert JSON back to XML
    const builder = new xml2js.Builder();
    const xmlString = builder.buildObject(result);

    // Write modified XML back to file
    fs.writeFile(stylesPath, xmlString, (err) => {});
  });
});

function modifyStyle(styles, styleName, newBackground) {
  const targetStyle = styles.find(style => style.$.name === styleName);

  if (targetStyle) {
    targetStyle.item.forEach(item => {
      if (item.$.name === 'android:background') {
        item._ = newBackground;
      }
    });
  } else {
    console.error(`Style "${styleName}" not found`);
  }
}

function copyFile(source, target) {
  fs.copyFile(source, target, (err) => {});
}

copyFile('src/app-resources/android/gradient.xml', '../../build/platforms/android/app/src/main/res/drawable/gradient.xml');
copyFile('src/app-resources/android/logo.xml', '../../build/platforms/android/app/src/main/res/drawable/logo.xml');
copyFile('src/app-resources/android/splash.xml', '../../build/platforms/android/app/src/main/res/layout/splash.xml');
copyFile('src/app-resources/android/MainActivity.java', '../../build/platforms/android/app/src/main/java/com/bitgreen/wallet/app/MainActivity.java');
