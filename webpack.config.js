/**
 * @credit
 * https://survivejs.com/webpack/optimizing/adding-hashes-to-filenames/
 * https://survivejs.com/webpack/appendices/hmr/
 * https://presentations.survivejs.com/advanced-webpack/
 * https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
 * https://blog.madewithenvy.com/getting-started-with-webpack-2-ed2b86c68783
 * https://github.com/GoogleChrome/preload-webpack-plugin/blob/master/demo/webpack.config.js
 */

const webpack = require('webpack');
const path = require('path');
const {resolve} = require('path');
const chalk = require('chalk');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkManifestHtmlWebpackPlugin = require('inline-chunk-manifest-html-webpack-plugin');
const NameAllModulesPlugin = require('name-all-modules-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');


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
    console.log(
        chalk.bgBlack.white(`${isDev ? ' 🐇🐇  Development' : ' 🦈🦈  Production'} build `), '\n'
    );

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
            // Set to false to disable including client scripts (like livereload)
            inline: true,
            // Open default browser while launching
            open: true,
            // Shows a full-screen overlay in the browser when there are compiler errors
            overlay: true,
            // Reduce console output
            stats: {
                assets: true,
                cached: false,
                cachedAssets: false,
                children: false,
                chunks: false,
                chunkModules: false,
                chunkOrigins: false,
                colors: true,
                depth: false,
                entrypoints: false,
                errors: true,
                errorDetails: true,
                hash: false,
                maxModules: 0,
                modules: false,
                performance: true,
            },
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

                // Everything else
                {
                    test: /\.(gif|png|jpg|jpeg\ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                    use: 'file-loader',
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
            // Lets us see exactly what we have in our JS bundle, set `openAnalyzer` to auto load
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                logLevel: 'silent',
                openAnalyzer: false,
                reportFilename: 'bundle-report.html',
            }),

            // Copy files to `dist`
            new CopyWebpackPlugin([{
                from: files.rootHTML,
            }]),

            // CSS needs `contenthash` for correct hashing
            new ExtractTextWebpackPlugin(
                fileHash('contenthash', 'css')
            ),

            // Inject JS and CSS assets into `index.html` as we're hashing them and minify the HTML
            new HtmlWebpackPlugin({
                minify: isProd && {
                    collapseBooleanAttributes: true,
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    decodeEntities: true,
                    minifyCSS: true,
                    minifyJS: true,
                    preventAttributesEscaping: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                },
                template: files.rootHTML,
            }),

            // Add `preload` Resource Hints to JS bundles
            new ScriptExtHtmlWebpackPlugin({
                preload: /\.js$/,
            }),

            // Inlines the manifest into `index.html`
            new InlineChunkManifestHtmlWebpackPlugin(),

            // For long-term caching, see:
            // https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
            new webpack.NamedModulesPlugin(),
            new webpack.NamedChunksPlugin((chunk) => {
                if (chunk.name) {
                    return chunk.name;
                }
                return chunk.modules.map(m => path.relative(m.context, m.request)).join('_');
            }),

            // Creates a vendor bundle and a manifest bundle
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: (module) => {
                    return module.context && module.context.indexOf('node_modules') !== -1;
                },
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
            }),

            // For long-term caching, see:
            // https://medium.com/webpack/predictable-long-term-caching-with-webpack-d3eee1d3fa31
            new NameAllModulesPlugin(),

            // Optimise for production build
            ifProd(
                new webpack.DefinePlugin({
                    'process.env': {
                        NODE_ENV: '"production"',
                    },
                })
            ),

            // Apply to all loaders
            ifProd(
                new webpack.LoaderOptionsPlugin({
                    minimize: true,
                    debug: false,
                    quiet: true,
                })
            ),

            // Optimise JS
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
