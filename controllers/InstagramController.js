var _ = require('lodash');
var helper = require('../config/helpers.js')
var keys = require('../config/keys.js')
var StorageManager = require('../modules/InstagramStorageManager.js');

console.log('Instagram Controller Loaded');

var newDataAvailableForTag = {};
var socketServer = null

initSockets = function (socketio) {
	socketServer = socketio;
}

verifyOrigin = function (req, res, next) {
	var digest = req.header('X-Hub-Signature');
	var hash = helper.sha1Digest(keys.instagram.client_secret, req.rawBody)
	if (hash == digest) return next()
	return res.send(401);
}

postPics = function (req, res) {
	if (req.body) {
		_.forEach(req.body, function (newMedia) {
			var tag = newMedia.object_id;
			setNewDataAvailableForTag(tag);
		});
	}
	return res.send(200);
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
		StorageManager.fetchNewMediaForTag(tag, function (err, data) {
			var encodedArray = _.map(data, function (image) {
				var stringifyImageObj = JSON.stringify(image);
				return helper.encodeNonUTF8String(stringifyImageObj);
			});
			if (socketServer && data) socketServer.emitNewPics(encodedArray);
		})
	});
}

module.exports = {
	initSockets: initSockets,
	postPics: postPics,
	getPics: getPics,
	verifyOrigin:verifyOrigin
}