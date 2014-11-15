$(function () {
	var socket = io.connect('http://6c9ab774.ngrok.com');
	// var socket = io.connect('http://localhost:3000');
	var count = 0;
	var imageSet = new SortedSet({ comparator: function(a, b) { 
		return b - a; 
	}});

	var imagesArray = [];

	socket.on('connect', function() {
		console.log('connected');
		$('#status').text('Ready')
	})

	socket.on('disconnect', function() {
		$('#status').text('Disconnected')
		console.log('disconnected');
	})

	socket.on('error', function (err) {
		$('#status').text('Error')
		if (err.description) console.log(err.description);
	});

	socket.on('newPics', function (data) {
		$('#status').text('Got Data');
		console.log('new pics' + data.length);
		count+= data.length;
		console.log('total count = ' + count);
		data.forEach(function (item) {
			storeImageToArray(item);
			imageSet.insert(item);
			var dom = createImageElement(item);
			if (dom) $('#image-gallery').prepend(dom);
		})
	})

	storeImageToArray = function (image) {
		imagesArray.unshift(image);
		if (imagesArray.length > 100) imagesArray.slice(0, 99);
	}


	createImageElement = function (image) {
		var imageObj = JSON.parse(image);
		console.log(imageObj);
		if (!imageObj.type == 'image') return false;
    var div = document.createElement('div');
    var a = document.createElement('a');
    var img = document.createElement('img');
    div.setAttribute('class', 'col-lg-3 col-md-4 col-xs-3');
    a.setAttribute('class', 'thumbnail');   
    a.setAttribute('href', imageObj.link);
    a.setAttribute('target', '_blank');
    img.setAttribute('class', 'img-responsive');
    // standard_resolution
    img.setAttribute('src', imageObj.images.standard_resolution.url);
    // img.setAttribute('src', 'http://kurtbradd.com/assets/img/break-things.jpg');
    a.appendChild(img);
    div.appendChild(a);
		return div;
	}

	$( "#target" ).click(itterateThroughSet);

});