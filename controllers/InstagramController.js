var _ = require('lodash');
var request = require('request');
var keys = require('../config/keys.js');
var environment = require('../config/environment.js');
var StorageManager = require('../modules/InstagramStorageManager.js');

console.log('Instagram Controller Loaded');

var newDataAvailableForTag = {};
var socketServer = null

initSockets = function (socketio) {
	socketServer = socketio;
}

postPics = function (socketio) {
	return function (req, res) {
		if (req.body) {
			_.forEach(req.body, function (newMedia) {
				var tag = newMedia.object_id;
				setNewDataAvailableForTag(tag);
			});
		}
		return res.send(200);
	}
}

getPics = function (req, res) {
	if (!req.query['hub.challenge']) return res.send(400);
	return res.send(200,req.query['hub.challenge']);
}

// Fetch Updated Media Every 8 Seconds
setInterval(function() {
	console.log('\nFETCHING NEW MEDIA');
	getUpdatedMedia();
}, 1000 * 4)

setNewDataAvailableForTag = function (tag) {
	newDataAvailableForTag[tag] = true;
}

getUpdatedMedia = function () {
	_.forEach(Object.keys(newDataAvailableForTag), function (tag) {
		delete newDataAvailableForTag[tag];
		instaUrl = getRecentMediaURLForTag(tag);
		getDataFromURL(instaUrl, function (error, data) {
			if (!error) StorageManager.parseDataForImages(data, function (data){
				console.log('got data to send to sockets');
				if (socketServer && data) socketServer.emitNewPics(JSON.stringify(data));
			});
		})
	});
}

module.exports = {
	initSockets: initSockets,
	postPics: postPics,
	getPics: getPics
}