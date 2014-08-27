
/**
 * Module dependencies.
 */

var serverConfig = require('./config/server.js');
var express = require('express');
var http = require('http');

var app = express();
serverConfig.setup(app, express);

app.get('*', function (req, res) {
	res.sendfile('./public/views/index.html');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
