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

exports.parseDataForImages = function (data, callback) {
	setNewImages(data.data, callback);
}

setNewImages = function (imageData, callback) {
	var diff = helper.arrayDifferenceById(imageData, recentImages);
	var compressData = _.map(diff, function(image) { return pluckRequiredData(image); });
	
	if (callback&& compressData.length > 0) callback(compressData);
	_.forEach(compressData, function (image) {
		recentImages.push(image);
	});
	
	if (recentImages.length > 1000) {
		recentImages.splice(0,recentImages.length-1000);
	}	
}

pluckRequiredData = function (imageData) {
	return _.pick(imageData, ['id']);
}

exports.pushMediaUpdatesToSockets = function (sockets) {
// get pics from redis and push to client
}

// callback(error, data);
addImageToRedis = function (image, callback) {

}

