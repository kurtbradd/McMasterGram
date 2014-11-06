var path = require('path');

exports.setup = function (app, express) {
	// all environments
	app.set('port', process.env.PORT || 3000);
	// app.use(express.favicon());
	app.use(express.logger('short'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.static('./public'));
	app.use(app.router);

	// development only
	if ('development' == app.get('env')) {
	  app.use(express.errorHandler());
	}
}