
/**
 * Module dependencies.
 */

var expressConfig = require('./config/expressConfig.js');
var express = require('express');
var http = require('http');

// Create & Configure Express Environment
var app = express();
expressConfig.setup(app, express);

// Create Server
var server = http.createServer(app)
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// Bind Socket.io to HTTP Server
var sockets = require('./modules/SocketsManager.js').init(server)

// Setup Instagram Client
var insta = require('./config/instagram.js').setup();

// Init Routes with Express App & Socket.io
require('./controllers/routes.js')(app, sockets);