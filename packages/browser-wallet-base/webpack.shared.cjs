const path = require('path');
const webpack = require('webpack');

const CopyPlugin = require('copy-webpack-plugin');
const ManifestPlugin = require('webpack-extension-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

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
    'browser-wallet-utils'
];

module.exports = (entry, alias = {}, useSplitChunk = false, browser = 'chrome') => {
    if(!['chrome', 'firefox', 'safari'].includes(browser)) {
        browser = 'chrome'
    }

    const manifest = require(`./manifest-${browser}.json`)
    let output_dir = path.join(__dirname, `../../build/${browser}`)

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
                PKG_VERSION: JSON.stringify(pkgJson.version)
            }
        }),
        new CopyPlugin({
            patterns: [{
                from: 'public',
                noErrorOnMissing: true,
                globOptions: {
                    ignore: [
                        '**/*.html'
                    ]
                }
            }]
        }),
        new CopyPlugin({
            patterns: [{
                from: path.resolve(__dirname, '../browser-wallet-ui/src/assets/icons'),
                to: 'assets/icons'
            }]
        }),
        new CopyPlugin({
            patterns: [{
                from: path.resolve(__dirname, '../browser-wallet-ui/src/components'),
                to: 'components'
            }]
        }),
        new ManifestPlugin({
            config: {
                base: manifest,
                extend: {
                    version: pkgJson.version.split('-')[0] // remove possible -beta.xx
                }
            }
        }),
        new MiniCssExtractPlugin()
    ]

    if(useSplitChunk) {
        plugins.push(new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'public/index.html',
            chunks: ['extension']
        }))
    }

    if(browser === 'safari') {
        // change output directory
        output_dir = path.join(__dirname, `../../build/${browser}/javascript`)

        // copy necessary files
        plugins.push(new CopyPlugin({
            patterns: [{
                from: 'src/safari',
                to: '../',
                noErrorOnMissing: true
            }]
        }))
    }

    const result = {
        context: __dirname,
        devtool: false,
        entry,
        module: {
            rules: [
                {
                    test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: './assets/[hash]-[name][ext][query]'
                    }
                },
                {
                    test: /\.(css|scss)$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: require.resolve('css-loader')
                        }
                    ]
                }
            ]
        },
        output: {
            chunkFilename: '[name].min.js',
            filename: '[name].js',
            globalObject: '(typeof self !== \'undefined\' ? self : this)',
            path: output_dir,
            publicPath: '',
        },
        performance: {
            hints: false
        },
        plugins: plugins,
        resolve: {
            alias: packages.reduce((alias, p) => ({
                ...alias,
                [`@bitgreen/${p}`]: path.resolve(__dirname, `../${p}/src`)
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
                process: require.resolve("process"),
                buffer: require.resolve("buffer"),
                zlib: false,
                url: false
                // http: false,
                // zlib: require.resolve("browserify-zlib"),
                // url: require.resolve("url/")
            }
        },
        watch: false
    };

    result.optimization = {}

    if (useSplitChunk) {
        result.optimization = {
            splitChunks: {
                chunks: 'all',
                maxSize: 2000000,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        name(module) {
                            const module_full = module
                                .identifier()
                                .split('|')[1]
                            let moduleFileName = 'undefined'
                            if(module_full) {
                                moduleFileName = module_full.split('/')
                                    .reduceRight((item) => item).split('.');
                            }
                            return `bundles/${moduleFileName[0]}.min`;
                        },
                    },
                    default: {
                        priority: -20,
                        reuseExistingChunk: true,
                        name(module) {
                            const module_full = module
                                .identifier()
                                .split('|')[1]
                            let moduleFileName = 'undefined'
                            if(module_full) {
                                moduleFileName = module_full.split('/')
                                    .reduceRight((item) => item).split('.');
                            }
                            return `${moduleFileName[0]}.min`;
                        },
                    }
                }
            }
        };
    }

    result.optimization.minimizer = [
        new CssMinimizerPlugin()
    ]

    return result;
};