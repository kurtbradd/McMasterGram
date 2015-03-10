var path = require('path');
var environment = require('./environment.js');
var helper = require('./helpers.js');

exports.setup = function (app, express) {
	// all environments
	app.set('port', process.env.PORT || environment.server.port);
	// app.use(express.favicon());
	app.use(express.compress());
	app.use(express.static('./public'));
	app.use(express.logger('short'));
	app.use(helper.rawBodyParser);
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
}