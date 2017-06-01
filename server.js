var webpack = require('webpack');
var config = require('./webpack.config.babel');
var compiler = webpack(config);
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var path = require('path');
var express = require('express');
var app = express();
var port = 5000;


// Middleware
app.use(
    webpackDevMiddleware(
        compiler, {
            noInfo: true,
            publicPath: config.output.publicPath
        }
    )
);

app.use(
    webpackHotMiddleware(compiler)
);


// Anything in `dist` can be accessed statically without this express router getting involved
app.use(
    express.static(
        path.join(__dirname, './../dist'), {
            dotfiles: 'ignore',
            index: false
        }
    )
);


app.use(
    '/src',
    express.static(
        path.join(__dirname, './../dist'), {
            dotfiles: 'ignore',
            index: false
        }
    )
);


// Always serve the same HTML file for all requests
app.get('*', function (req, res) {
    res.sendFile(
        path.join(__dirname, './../src/index.html')
    );
});


// Error handling
app.use(function (req, res, next) {
    console.log('404');
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res) {
    res.sendStatus(err.status || 500);
});


// Listen and log `port` to the console
app.listen(port);

console.log('Go to: http://localhost:' + port);
console.log('✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰  ✰');
console.log('Or go on holiday… 🍹  ☀️  🌴');
