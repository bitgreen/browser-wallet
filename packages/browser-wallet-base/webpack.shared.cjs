const path = require('path');
const webpack = require('webpack');

const FileManagerPlugin = require('filemanager-webpack-plugin');
const ManifestPlugin = require('webpack-extension-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const pkgJson = require('./package.json');

const args = process.argv.slice(2);
let mode = 'production';

if (args) {
  args.forEach((p, index) => {
    if (p === '--mode') {
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
  if (!['chrome', 'firefox', 'safari', 'ios', 'android'].includes(platform)) {
    platform = 'chrome';
  }

  const is_app = !!['ios', 'android'].includes(platform)
  const manifest = !is_app ? require(`./manifest-${platform}.json`) : null
  let platform_dir = path.join(__dirname, `../../build/${platform}`);
  let output_dir = platform_dir;
  let cleanDirs = [platform_dir];
  if(platform === 'safari') {
    output_dir = path.join(__dirname, `../../build/apple/Shared (Extension)`)
    cleanDirs = [path.join(__dirname, `../../build/apple`)]
  } else if(platform === 'ios') {
    output_dir = path.join(__dirname, `../../build/apple/iOS (App)/public`)
  } else if(platform === 'android') {
    output_dir = path.join(__dirname, `../../build/android/app/src/main/assets/public`)
  }
  
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
  ];
  
  let filesToCopy = [
    {
      source: path.resolve(__dirname, '../browser-wallet-ui/src/components'),
      destination: path.join(output_dir, 'components')
    },
  ];

  if (useSplitChunk) {
    if(is_app) {
        plugins.push(
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: 'public/app.html',
                chunks: ['app']
            })
        );
    } else {
        plugins.push(
            new HtmlWebpackPlugin({
                filename: 'index.html',
                template: 'public/index.html',
                chunks: ['extension']
            })
        );
    }
  }

  if(!is_app) {
    plugins.push(new ManifestPlugin({
      config: {
        base: manifest,
        extend: {
          version: pkgJson.version.split('-')[0] // remove possible -beta.xx
        }
      }
    }))
  }

  if(platform === 'safari') {
    filesToCopy.push({
      source: 'src/apple',
      destination: path.join(output_dir, '../')
    });
    filesToCopy.push({
      source: path.join(__dirname, '../browser-wallet-ui/src/assets/icons/square'),
      destination: path.join(output_dir, 'icons')
    });
  } else if(platform === 'ios') {
    filesToCopy.push({
      source: 'capacitor.config.json',
      destination: path.join(__dirname, '../../build/apple/iOS (App)/')
    });
  } else if(platform === 'android') {
    filesToCopy.push({
      source: 'src/android',
      destination: path.join(__dirname, '../../build/android/'),
    });
    filesToCopy.push({
      source: 'capacitor.config.json',
      destination: path.join(__dirname, '../../build/android/app/src/main/assets/')
    });
  } else {
    filesToCopy.push({
      source: path.join(__dirname, '../browser-wallet-ui/src/assets/icons/normal'),
      destination: path.join(output_dir, 'icons')
    });
  }

  plugins.push(new FileManagerPlugin({
    events: {
      onStart: {
        delete: cleanDirs
      },
      onEnd: {
        copy: filesToCopy
      }
    },
    runOnceInWatchMode: true
  }));

  const result = {
    context: __dirname,
    devtool: mode == 'development' ? 'source-map' : false,
    entry,
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
          type: 'asset/resource',
          generator: {
            filename: './assets/[hash]-[name][ext][query]',
          },
        },
        {
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
      chunkFilename: '[name].min.js',
      filename: '[name].js',
      globalObject: '(typeof self !== \'undefined\' ? self : this)',
      path: output_dir,
      publicPath: '',
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
    watch: false,
  };

  result.optimization = {};

  if (useSplitChunk) {
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
    };
  }

  return result;
};
