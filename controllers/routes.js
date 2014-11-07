module.exports = function (app, socketio) {

	console.log('Routes Loaded');	
	// InstagramController Routes
	var InstagramController = require('./InstagramController.js');
	InstagramController.initSockets(socketio);
	app.get('/pics', InstagramController.getPics);
	app.post('/pics', InstagramController.postPics(socketio));

	// Catchall Route
	app.get('*', function (req, res) {
		res.sendfile('./public/views/index.html');
	});
}