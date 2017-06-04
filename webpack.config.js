// https://survivejs.com/webpack/
// https://presentations.survivejs.com/advanced-webpack/
// https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31

const webpack = require('webpack');
const {resolve} = require('path');
const chalk = require('chalk');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkManifestHtmlWebpackPlugin = require('inline-chunk-manifest-html-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');


const dirs = {
    dist: 'dist',
    src: 'src'
}

const files = {
    rootHTML: './index.ejs',
    rootJS: './index.js',
}

const paths = {
    dist: resolve(__dirname, dirs.dist),
    src: resolve(__dirname, dirs.src),
}


module.exports = env => {
    // Plugins
    const addPlugin = (add, plugin) => add ? plugin : undefined;
    const removeEmptyPlugin = array => array.filter(i => !!i);

    // Environments
    const isDev = env.dev;
    const isProd = env.prod;
    const ifDev = plugin => addPlugin(isDev, plugin);
    const ifProd = plugin => addPlugin(isProd, plugin);
    if (isDev) console.log(chalk.black.bgBlue.bold('🕵️‍♀️🕵️‍♀️🕵️‍♀️   Development build '));
    if (isProd) console.log(chalk.black.bgYellow.bold('🕺🕺🕺   Production build '));

    // Hash
    const fileHash = (type = 'chunkhash', ext = 'js') => (
        isDev ? `[name].${ext}` : `[name]-[${type}:8].${ext}`
    );

    return {
        bail: isProd,

        context: paths.src,

        devServer: {
            // Enable gzip compression of generated files
            compress: true,
            // A directory or URL to serve HTML content from
            contentBase: paths.dist,
            // Fallback to '/index.html' for SPA's
            historyApiFallback: true,
            // Enable HMR
            hot: true,
            // hotOnly: true,
            // Set to false to disable including client scripts (like livereload)
            inline: true,
            // Open default browser while launching
            open: true,
            // Shows a full-screen overlay in the browser when there are compiler errors
            overlay: true,
            // By default files from `contentBase` will not trigger a page reload
            watchContentBase: true,
            // Reportedly, this avoids CPU overload on some systems
            // https://github.com/facebookincubator/create-react-app/issues/293
            watchOptions: {
                ignored: /node_modules/,
            },
        },

        devtool: isProd ? 'source-map' : 'cheap-module-source-map',

        entry: [
            files.rootJS,
        ],

        module: {
            rules: [
                // JS
                {
                    include: paths.src,
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            query: {
                                cacheDirectory: true,
                            },
                        },
                    ]
                },

                // JSON
                {
                    include: paths.src,
                    test: /\.json$/,
                    loader: 'json',
                },

                // CSS
                {
                    include: paths.src,
                    test: /\.css$/,
                    use: ['css-hot-loader'].concat(
                        ExtractTextWebpackPlugin.extract(
                            {
                                fallback: 'style-loader',
                                use: [
                                    {
                                        loader: 'css-loader',
                                        options: {
                                            minimize: isProd,
                                        }
                                    },
                                    {
                                        loader: 'postcss-loader',
                                        options: {
                                            plugins: () => {
                                                return [
                                                    require('autoprefixer')
                                                ];
                                            }
                                        },
                                    },
                                ]
                            },
                        )
                    )
                },
            ]
        },

        output: {
            filename: fileHash(),
            path: paths.dist,
            pathinfo: isDev,
        },

        performance: {
            hints: isProd && 'error',
        },

        plugins: removeEmptyPlugin([
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
            }),

            new CopyWebpackPlugin([{
                from: files.rootHTML,
            }]),

            new ExtractTextWebpackPlugin(
                fileHash('contenthash', 'css')
            ),

            new HtmlWebpackPlugin({
                template: files.rootHTML,
            }),

            new InlineChunkManifestHtmlWebpackPlugin(),

            // new WebpackChunkHash(),

            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: (module) => {
                    return module.context && module.context.indexOf('node_modules') !== -1;
                },
            }),

            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
            }),

            ifDev(
                new webpack.NamedModulesPlugin(),
            ),

            ifProd(
                new webpack.DefinePlugin({
                    'process.env': {
                        NODE_ENV: '"production"',
                    },
                })
            ),

            ifProd(
                new webpack.HashedModuleIdsPlugin(),
            ),

            ifProd(
                new webpack.LoaderOptionsPlugin({
                    minimize: true,
                    debug: false,
                    quiet: true,
                })
            ),

            ifProd(
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        screw_ie8: true,
                        warnings: false,
                    },
                    mangle: {
                        screw_ie8: true,
                    },
                    output: {
                        comments: false,
                        screw_ie8: true,
                    },
                })
            ),
        ]),

        resolve: {
            alias: {
                Assets: `${paths.src}/assets`,
                Components: `${paths.src}/components`,
                Utils: `${paths.src}/utils`,
            },
            modules: [
                paths.src,
                'node_modules'
            ],
        },
    };
};
