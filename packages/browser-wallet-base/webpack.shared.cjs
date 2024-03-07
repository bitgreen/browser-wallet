const path = require('path');
const webpack = require('webpack');
const exec = require('child_process').exec;

const FileManagerPlugin = require('filemanager-webpack-plugin');
const ManifestPlugin = require('webpack-extension-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pkgJson = require('./package.json');
const sharp = require("sharp");

const args = process.argv.slice(2);
let mode = 'production';

if (args) {
  args.forEach((arg, index) => {
    if (arg === '--mode') {
      mode = args[index + 1] || mode;
    }
  });
}

console.log('You are using ' + mode + ' mode.');

const packages = [
  'browser-wallet-base',
  'browser-wallet-core',
  'browser-wallet-ui',
  'browser-wallet-utils',
];

module.exports = (
  entry,
  alias = {},
  useSplitChunk = false,
  platform = 'chrome'
) => {
  if (!['chrome', 'firefox', 'safari', 'android', 'ios'].includes(platform)) {
    platform = 'chrome';
  }

  const is_app = ['android', 'ios'].includes(platform)
  const manifest = !is_app ? require(`./manifest-${platform}.json`) : null
  const output_dir = path.join(__dirname, `../../build/${is_app ? 'app' : (platform === 'safari' ? 'tmp/safari' : 'platforms/' + platform)}`)

  // clean destination folder
  exec('rm -Rf ' + output_dir, (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  });
  
  let plugins = [
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser.js',
    }),
    new webpack.IgnorePlugin({
        contextRegExp: /moment$/,
        resourceRegExp: /^\.\/locale$/
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        PKG_NAME: JSON.stringify(pkgJson.name),
        PKG_VERSION: JSON.stringify(pkgJson.version),
        PLATFORM: JSON.stringify(platform)
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      chunks: [is_app ? 'app' : 'extension']
    }),
  ]

  let copyFiles = [{ // components
    source: path.resolve(__dirname, '../browser-wallet-ui/src/components'),
    destination: path.join(output_dir, 'components')
  }]

  plugins.push(new FileManagerPlugin({
    events: {
      onEnd: {
        copy: copyFiles
      }
    }
  }))

  if(is_app) {
    if(mode === 'development') {
      plugins.push({
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
            exec('cd ' + path.resolve(__dirname) + ' && cap sync ' + platform, (err, stdout, stderr) => {
              if (stdout) process.stdout.write(stdout);
              if (stderr) process.stderr.write(stderr);
            });
          });
        }
      })
    }
  } else {
    // add manifest for extension
    plugins.push(new ManifestPlugin({
      config: {
        base: manifest,
        extend: {
          version: pkgJson.version.split('-')[0] // remove possible -beta.xx
        }
      }
    }))
  }

  const result = {
    context: __dirname,
    devtool: mode == 'development' ? 'inline-source-map' : false,
    entry,
    module: {
      rules: [
        { // graphics and fonts go in assest folder
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
          type: 'asset/resource',
          generator: {
            filename: './assets/[hash]-[name][ext][query]',
          },
        },
        { // compile and auto-prefix SCSS
          test: /\.s?css$/,
          use: [
            require.resolve('style-loader'),
            require.resolve('css-loader'),
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('autoprefixer')
                  ]
                }
              }
            },
            require.resolve('sass-loader'),
          ],
        },
      ],
    },
    output: {
      filename: '[name].js',
      path: output_dir,
    },
    performance: {
      hints: false,
    },
    plugins: plugins,
    resolve: {
      alias: packages.reduce((alias, p) => ({
        ...alias,
        [`@bitgreen/${p}`]: path.resolve(__dirname, `../${p}/src`),
      })),
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallback: {
        crypto: require.resolve('crypto-browserify'),
        path: require.resolve('path-browserify'),
        stream: require.resolve('stream-browserify'),
        os: require.resolve('os-browserify/browser'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        process: require.resolve('process'),
        buffer: require.resolve('buffer'),
        zlib: false,
        url: false,
      },
    },
    optimization: {},
    watch: mode === 'development',
    watchOptions: {
      ignored: /node_modules|\.json$|\.csj$|\.xml|\.md$/
    }
  }

  if(useSplitChunk) {
    result.optimization = {
      splitChunks: {
        chunks: 'all',
        maxSize: 6000000,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            name(module) {
              return 'default'
            },
          },
          default: {
            priority: -20,
            reuseExistingChunk: true,
            name(module) {
              return 'main'
            },
          },
        },
      },
    }
  }

  return result
}
