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
	redis.keys(key, function (err, hashtags) {
		_.forEach(hashtags, function (hashtag) {
			redis.get(hashtag, function (err, tag_id){
				latestMinTagId[hashtag.split(':').pop()] = tag_id;
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

getRecentImages = function (offset, limit, callback) {
	var allHashKey = 'all_hashtag_union:mcmaster_university';
	var completionHandler = function (err, data) {
		console.log(data.length);
		callback(data);
	}
	redis.zrevrange(allHashKey, offset, limit, completionHandler);
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
		console.log(newMedia);
		console.log(newMedia.length + " new university media items");
	})
}, 1000 * 5)

setInterval(function() {
	console.log('\nFETCHING NEW MEDIA');
	fetchNewMediaForTag('college', function (newMedia){
		console.log(newMedia);
		console.log(newMedia.length + " new college media items");
	})
}, 1000 * 5)