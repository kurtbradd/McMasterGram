var _ = require('lodash');
var helper = require('../config/helpers.js')
var redis = require("redis").createClient();

var recentImages = [];

redis.on("connect", function () {
	console.log('Redis Connected');
});

exports.initWithSocket = function (socket) {
	socketServer = socket;
}

exports.parseDataForImages = function (data) {
	console.log(data.data.length);
	setNewImages(data.data);
}

exports.setNewImages = setNewImages = function (imageData) {
	var diff = helper.arrayDifferenceById(imageData, recentImages);
	_.forEach(diff, function (image) {
		recentImages.push(image);
		// add image to redis
	});
	if (recentImages.length > 1000) {
		recentImages.splice(0,recentImages.length-1000);
	}	
}

exports.pushMediaUpdatesToSockets = function (sockets) {
// get pics from redis and push to client
}

// callback(error, data);
addImageToRedis = function (image, callback) {

}

