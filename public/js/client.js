$(function () {
	
	var socket = io.connect('http://localhost:3000');

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
		if (err.description) return console.log(err.description);
	});

	var recievePictureHandler = function (data) {
		$('#status').text('Got Data');
		data.reverse().forEach(function (item) {
			storeImageToArray(item);
			imageSet.insert(item);
			var dom = createImageElement(item);
			if (dom) $('#image-gallery').prepend(dom);
		})
	}

	socket.on('oldPics', recievePictureHandler);
	socket.on('newPics', recievePictureHandler);

	var storeImageToArray = function (image) {
		imagesArray.unshift(image);
		if (imagesArray.length > 100) imagesArray.slice(0, 99);
	}

	var createImageElement = function (image) {
		if (!image) return false;
		var imageObj = JSON.parse(image);
		if (!imageObj.type == 'image') return false;
		var doc = document; //performance measure
    var div = doc.createElement('div');
    var a = doc.createElement('a');
    var img = doc.createElement('img');

    div.setAttribute('class', 'col-lg-3 col-md-4 col-sm-6 col-xs-12');
    a.setAttribute('class', 'thumbnail');   
    a.setAttribute('href', imageObj.link);
    a.setAttribute('target', '_blank');
    img.setAttribute('class', 'img-responsive');
    img.setAttribute('src', imageObj.images.standard_resolution.url);
    
    a.appendChild(img);
    div.appendChild(a);
		return div;
	}

	// $( "#target" ).click(itterateThroughSet);

});