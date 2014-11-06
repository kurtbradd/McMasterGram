var InstagramController = require('./InstagramController.js');

module.exports = function (app, socketio) {

	console.log('Routes Loaded');
	
	// InstagramController Routes
	app.get('/pics', InstagramController.getPics);
	app.post('/pics', InstagramController.postPics(socketio));

	// Catchall Route
	app.get('*', function (req, res) {
		res.sendfile('./public/views/index.html');
	});
}