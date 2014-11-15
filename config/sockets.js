exports.init = function (server) {

	var io = require('socket.io').listen(server);

	io.sockets.on('connection', function (socket) {
	  
	  console.log('a socket connected');

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