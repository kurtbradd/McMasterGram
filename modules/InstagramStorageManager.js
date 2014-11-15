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
	redis.zrevrange(ALLHASH_UNION_KEY, offset, limit, callback);
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
	var args = [];
	var key = 'hashtag:' + tag;
	var errorLogger = function (err, data) {
		if (err) console.log(err);
	}

	_.forEach(media, function (image) {
		args.push(image.created_time);
		args.push(JSON.stringify(image));
	});

	args.unshift(key);
	redis.zadd(args, errorLogger); //add new media
	redis.zremrangebyrank(key, 0, -1001, errorLogger);
	storeUnionOfHashtags(errorLogger); //union of all tags
}

storeUnionOfHashtags = function (completionHandler) {
	var hashSets = Object.keys(latestMinTagId);
	var unionArgs = ['all_hashtag_union', hashSets.length];
	_.forEach(hashSets, function (hashtag) {
		unionArgs.push("hashtag:" + hashtag);
	});
	unionArgs.push("AGGREGATE");
	unionArgs.push("MAX");
	redis.zunionstore(unionArgs,completionHandler);
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
		var keys = ['created_time','tags', 'location', 'link', 'likes', 'id',
								'type', 'videos', 'images','caption', 'user'];
		return _.pick(image, keys);
	});
}

setInterval(function() {
	console.log('\nFETCHING NEW MEDIA');
	fetchNewMediaForTag('university', function (newMedia){
		console.log(newMedia.length + " new university media items");
	})
}, 1000 * 5)

setInterval(function() {
	console.log('\nFETCHING NEW MEDIA');
	fetchNewMediaForTag('college', function (newMedia){
		console.log(newMedia.length + " new college media items");
	})
}, 1000 * 5)

getRecentImages(0, 1, function (err, data) {
	console.log(data.length);
})exports.fetchNewMediaForTag = fetchNewMediaForTag;
exports.getRecentImages = getRecentImages;