$(function () {

	var socket = io.connect('http://localhost');

	socket.on('connect', function() {
		console.log('connected');
		$('#status').text('Ready')
	})

	socket.on('newPic', function (data) {
		
	})

});