$(function () {
	var socket = io.connect('http://6c9ab774.ngrok.com');
	// var socket = io.connect('http://localhost:3000');

	socket.on('connect', function() {
		console.log('connected');
		$('#status').text('Ready')
	})

	socket.on('disconnect', function() {
		console.log('disconnected');
	})

	socket.on('error', function (err) {
		if (err.description) console.log(err.description);
	  // if (err) console.log(err);
	});

	socket.on('newPics', function (data) {
		$('#status').text('Got Data');
		console.log(JSON.parse(data));
	})

});