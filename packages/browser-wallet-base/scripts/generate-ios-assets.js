import sharp from 'sharp';
import fs from 'fs';
import * as path from "path";

// Create output directory if it doesn't exist
let outputDirectory =  `../../build/platforms/ios/App/App/Assets.xcassets/Splash.imageset`;

// Load the input image
const inputImagePath = 'src/app-resources/splash.png';

// Define the filenames for different scales and appearances
const imageFilenames = [
  { scale: '1x', appearance: 'light' },
  { scale: '2x', appearance: 'light' },
  { scale: '3x', appearance: 'light' },
  { scale: '1x', appearance: 'dark' },
  { scale: '2x', appearance: 'dark' },
  { scale: '3x', appearance: 'dark' }
];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true }); // Create output directory along with parent directories if they don't exist

// Copy the source image to different filenames
imageFilenames.forEach(({ scale, appearance }) => {
  const filename = `Default@${scale}~universal~any-${appearance}.png`;
  const outputPath = path.join(outputDirectory, filename);
  fs.copyFileSync(inputImagePath, outputPath);
});

// Generate JSON data
const contentsJson = {
  images: imageFilenames.map(({ scale, appearance }) => ({
    idiom: 'universal',
    filename: `Default@${scale}~universal~any-${appearance}.png`,
    scale: `${scale}`,
    ...(appearance ? { appearances: [{ appearance: 'luminosity', value: appearance }] } : {})
  })),
  info: {
    version: 1,
    author: 'xcode'
  }
};

// Write Contents.json to file
fs.writeFileSync(`${outputDirectory}/Contents.json`, JSON.stringify(contentsJson, null, 4));

console.log('Splash screen and Contents.json generated successfully');

