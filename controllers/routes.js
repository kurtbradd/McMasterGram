module.exports = function (app, socketio) {
	console.log('Routes Loaded');	
	// InstagramController Routes
	var InstaCtrl = require('./InstagramController.js');
	InstaCtrl.initSockets(socketio);
	app.get('/pics', InstaCtrl.getPics);
	app.post('/pics', InstaCtrl.verifyOrigin, InstaCtrl.postPics);

	// Catchall Route
	app.get('*', function (req, res) {
		res.charset = '"utf-8"';
		res.sendfile('./public/views/index.html');
	});
}