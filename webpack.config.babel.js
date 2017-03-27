const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


module.exports = {
    devtool: 'cheap-module-source-map',

    entry: './src/index.js',

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    module: {
        rules: [
            // ⇒⇒ JS
            {
                test: /\.(js|jsx)$/,
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
            // ⇒⇒ CSS
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract(
                    {
                        fallback: "style-loader",
                        use: [
                            'css-loader',
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
                    }
                )
            }
        ]
    },

    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),
        new ExtractTextPlugin('style.css')
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'bundle.js'
        // }),
    ],

    resolve: {
        extensions: [
            '.js',
            '.json',
            '.jsx'
        ]
    }
};