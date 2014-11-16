var StorageManager = require('./InstagramStorageManager.js');

exports.init = function (server) {

	var io = require('socket.io').listen(server);

	io.sockets.on('connection', function (socket) {

		console.log('a socket connected');
		StorageManager.getRecentImages(0, 20, function (err, data) {
			if (err) return console.log(err);
			socket.emit('oldPics', data);
		})

	  socket.on('disconnect', function() {
	  	console.log('a socket disconnected');
	  })

	  socket.on('error', function (err) {
		  if (err) console.log(err);
		});	
	});

	return {
		emitNewPics: function (pics) {
			io.sockets.emit('newPics', pics);
		}
	}

}