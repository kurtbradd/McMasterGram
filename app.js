
/**
 * Module dependencies.
 */

var serverConfig = require('./config/server.js');
var express = require('express');
var http = require('http');

var app = express();
serverConfig.setup(app, express);

app.post('/pics', function (req, res) {
	res.send(200);
})

app.get('/pics', function (req, res) {
	console.log(req.query);
	res.send(200);
})

app.get('*', function (req, res) {
	res.sendfile('./public/views/index.html');
});

var server = http.createServer(app)
var sockets = require('./config/sockets.js').init(server)

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var insta = require('./config/instagram.js').setup();