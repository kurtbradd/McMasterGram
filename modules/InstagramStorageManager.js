var _ = require('lodash');
var request = require('request');
var helper = require('../config/helpers.js')
var environment = require('../config/environment.js');
var keys = require('../config/keys.js');
var redis = require("redis").createClient();

var recentImages = [];

var latestMinTagId = {
};

redis.on("connect", function () {
	console.log('Redis Connected');
	var key = 'min_tag_id:hashtag:*';
	redis.keys(key, function (err, data) {
		_.forEach(data, function (hashtag_key) {
			redis.get(hashtag_key, function (err, value){
				var hashtag = hashtag_key.split(':').pop();
				latestMinTagId[hashtag] = value;
				console.log(latestMinTagId);
			})
		});
	})
});

fetchNewMediaForTag = function (tag, callback) {
	var apiUrl = recentMediaURLBuilder(tag);
	getDataFromURL(apiUrl, function (err, response) {
		if (err) return console.log(err);
		var newMedia = parseMediaFromResponse(response);
		if (newMedia) {
			storeMediaDataToRedis(tag, newMedia);
			storeMinTagIdForResponse(tag, response);
			if (callback) return callback(newMedia);
		}
	})
}

exports.fetchNewMediaForTag = fetchNewMediaForTag;

exports.getRecentImages = function () {
	// return from redis
	// for each hashtag stored
	// fetch all images
	// order by date??
	// execute command
	// limit by 100?
	// LRANGE(0, x)
}

exports.fetchNewMediaForTag = fetchNewMediaForTag;
exports.getRecentImages = getRecentImages;

getDataFromURL = function (url, callback) {
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			if (callback) return callback(null, JSON.parse(body));
		}
		if (callback) callback(error);
	});
}

recentMediaURLBuilder = function (tag) {
	var instaTagApiUrl = environment.instagram.api.v1.tags.url;
	var tagPath = '/' + tag;
	var recentMediaPath = '/media/recent'
	var queryParams = '?client_id=' + keys.instagram.client_id;
	if (latestMinTagId[tag]) queryParams += '&min_tag_id=' + latestMinTagId[tag];
	return [instaTagApiUrl,tagPath,recentMediaPath, queryParams].join('');
}

parseMediaFromResponse = function (response) {
	var media = response.data;
	if (media.length < 1) return false;
	return reduceMediaMetaData(media);
}

storeMediaDataToRedis = function (tag, media, callback) {
	var stringMedia = _.map(media, function (image) {
		return JSON.stringify(image);
	});
	var key = 'hashtag:' + tag;
	stringMedia.unshift(key);
	redis.lpush(stringMedia, function (err, data) {
		if (err) console.log(err);
		if (data) console.log("length of newly pushed data: " + data);
	});
	redis.ltrim(key, 0, 99);
	// redis.lrange(key, 0, -1, function (err, data) {});
}

storeMinTagIdForResponse = function (tag, response) {
	var newMinTagId = response.pagination.min_tag_id;
	if (newMinTagId) {
		redis.set("min_tag_id:hashtag:" + tag, newMinTagId);
		return latestMinTagId[tag] = newMinTagId;
	}
}

reduceMediaMetaData = function (media) {
	return _.map(media, function (image) {
		var keys = ['tags', 'location', 'link', 'likes', 'id',
								'type', 'videos', 'images','caption', 'user'];
		return _.pick(image, keys);
	});
}


setInterval(function() {
	console.log('\nFETCHING NEW MEDIA');
	fetchNewMediaForTag('university', function (newMedia){
		console.log(newMedia.length + " new media items");
	})
}, 1000 * 5)