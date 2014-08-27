exports.init = function (server) {

	var io = require('socket.io').listen(server);
	io.sockets.on('connection', function (socket) {
	  console.log('a socket connected');

	  socket.on('disconnect', function() {
	  	console.log('a socket disconnected');
	  })
	});

	return {
		emitNewPic: function (picUrl) {
			io.sockets.emit('newPic', picUrl);
		}
	}

}