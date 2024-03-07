import sharp from 'sharp';
import fs from 'fs';

// Parse command-line arguments
const args = process.argv.slice(2);
const platformIndex = args.indexOf('--platform');
const platform = platformIndex !== -1 && args[platformIndex + 1]; // Get the platform argument value

if (!['macos', 'ios', 'safari', 'chrome', 'firefox'].includes(platform)) {
  console.log('Invalid platform.')
  process.exit(0)
}

// Load the input image
const inputImagePath = ['macos', 'ios', 'safari', 'chrome'].includes(platform) ? 'src/app-resources/icon_rounded.png' : 'src/app-resources/icon.png';

// Create output directory if it doesn't exist
let outputDirectory =  `../../build/platforms/${platform}/icons`;
let dimensions = [16, 32, 48, 64, 128]

if(platform === 'macos') {
  outputDirectory =  `../../build/platforms/safari/Bitgreen Wallet/Bitgreen Wallet/Assets.xcassets/AppIcon.appiconset`;

  dimensions = [16, 32, 128, 256, 512]
} else if(platform === 'ios') {
  outputDirectory =  `../../build/platforms/ios/App/App/Assets.xcassets/AppIcon.appiconset`;

  dimensions = [20, 29, 40, 60, 76, 83.5, 1024]
} else if(platform === 'safari') {
  outputDirectory =  `../../build/tmp/safari/icons`;

  dimensions = [16, 32, 64, 128, 256, 512, 1024]
}

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true }); // Create output directory along with parent directories if they don't exist

function generateIcon(size, idiom = '', scale = 1) {
  const filename = idiom.length > 0 ? `icon-${size}@${scale}x.png` : `${size}x${size}.png`

  const scaledSize = Math.round(size * scale);

  sharp(inputImagePath)
    .resize(scaledSize, scaledSize)
    .toFile(`${outputDirectory}/${filename}`, (err, info) => {
      if (err) {
        console.error(`Error resizing image for dimension ${size}:`, err);
      } else {
        // console.log(`Resized image for dimension ${size} (${scale}x) saved successfully.`);
      }
    });

  return {
    size: `${size}x${size}`,
    idiom: idiom,
    filename: filename,
    scale: `${scale}x`
  };
}

// Generate Contents.json
const contentsJson = {
  images: [],
  info: {
    version: 1,
    author: 'xcode'
  }
};

for (const size of dimensions) {
  if(platform === 'macos') {
    contentsJson.images.push(generateIcon(size, 'mac', 1));
    contentsJson.images.push(generateIcon(size, 'mac', 2));
  } else if (platform === 'ios') {
    if (size === 1024) {
      contentsJson.images.push(generateIcon(size, 'ios-marketing', 1));
    } else {
      if (![76, 83.5].includes(size)) {
        contentsJson.images.push(generateIcon(size, 'iphone', 2));
        contentsJson.images.push(generateIcon(size, 'iphone', 3));
      }

      if (![60, 83.5].includes(size)) {
        contentsJson.images.push(generateIcon(size, 'ipad', 1));
      }
      if(size !== 60) {
        contentsJson.images.push(generateIcon(size, 'ipad', 2));
      }
    }
  } else {
    contentsJson.images.push(generateIcon(size));
  }
}

if(['macos', 'ios'].includes(platform)) {
  fs.writeFileSync(`${outputDirectory}/Contents.json`, JSON.stringify(contentsJson, null, 4));
}

console.log('Icons generated successfully.');

