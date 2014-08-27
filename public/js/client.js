var socket = io.connect('http://localhost');

socket.on('connect', function() {
	console.log('connected');
	// $('#status').text('Ready')
})


$(function () {
    // do stuff after DOM has loaded
});