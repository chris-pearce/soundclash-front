const webpack = require('webpack');
const path = require('path');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');


const dirs = {
    dist: 'dist',
    src: 'src'
}

const paths = {
    dist: path.resolve(__dirname, dirs.dist),
    srcAbs: path.resolve(__dirname, dirs.src),
    srcRel: `./${dirs.src}/`
}


module.exports = env => {
    return ({
        devtool: 'eval-source-map',

        entry: [
            `${paths.srcRel}index.js`
        ],

        output: {
            filename: 'app.js',
            path: paths.dist,
            publicPath: '/'
        },

        resolve: {
            extensions: [
                '.js',
                '.json',
                '.jsx'
            ]
        },

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            query: {
                                cacheDirectory: true
                            }
                        }
                    ]
                },
                {
                    test: /\.json$/,
                    exclude: /node_modules/,
                    loader: 'json'
                },
                {
                    test: /\.css$/,
                    exclude: /node_modules/,
                    use: ['css-hot-loader'].concat(ExtractTextWebpackPlugin.extract({
                        fallback: 'style-loader',
                        use: [
                            {
                                loader: 'css-loader',
                                // options: {minimize: true}
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    plugins: function () {
                                        return [
                                            require('autoprefixer')
                                        ];
                                    }
                                }
                            }
                        ]
                    }))
                }
            ]
        },

        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: 'bundle-report.html',
                generateStatsFile: true,
                statsFilename: 'bundle-stats.json',
                openAnalyzer: false
            }),
            new CopyWebpackPlugin([{from: `${paths.srcRel}index.html`}]),
            new ExtractTextWebpackPlugin('app.css'),
            new webpack.optimize.OccurenceOrderPlugin()
            // new webpack.HotModuleReplacementPlugin()
        ],

        devServer: {
            // A directory or URL to serve HTML content from
            contentBase: paths.dist,
            // Fallback to '/index.html' for SPA's
            historyApiFallback: true,
            // Set to false to disable including client scripts (like livereload)
            inline: true,
            // Open default browser while launching
            open: true,
            // Enable gzip compression
            compress: true,
            // Enable HMR
            hot: true
        }
    });
};

// if (process.env.NODE_ENV === 'production') {
//     module.exports.plugins.push(
//         new webpack.optimize.UglifyJsPlugin()
//     );
// }
