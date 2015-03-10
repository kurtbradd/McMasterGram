var _ = require('lodash');
var request = require('request');
var environment = require('../config/environment.js');
var keys = require('../config/keys.js');
var redis = require("redis").createClient();

var ALLHASH_UNION_KEY = 'all_hashtag_union';
var recentImages = [];
var latestMinTagId = {};
var mostRecentCreatedTime;

redis.on("connect", function () {
	console.log('Redis Connected');
	var key = 'min_tag_id:hashtag:*';
	redis.keys(key, function (err, hashtags) {
		_.forEach(hashtags, function (hashtag) {
			redis.get(hashtag, function (err, tag_id){
				latestMinTagId[hashtag.split(':').pop()] = tag_id;
			})
		});
	});
	// store created_time for most recent picture;
	getRecentImages(0,0, function (err, data) {
		mostRecentCreatedTime = JSON.parse(data[0]).created_time;
	});
});

fetchNewMediaForTag = function (tag, callback) {
	if (!tag) return;
	var apiUrl = recentMediaURLBuilder(tag);
	getDataFromURL(apiUrl, function (err, response) {
		if (err) return console.log(err);
		var newMedia = parseMediaFromResponse(response);
		if (newMedia) {
			storeMediaDataToRedis(tag, newMedia);
			storeMinTagIdForResponse(tag, response);
			var newMaxCreatedTime = getMaxCreatedTimeFromImages(newMedia);
			if (newMaxCreatedTime > mostRecentCreatedTime) {
				getImagesAfterTime(mostRecentCreatedTime, function (err, data) {
					if (err) return console.log(err);
					console.log("New Pictures Count: " + data.length);
					if (callback) return callback(null, data);
				})
				mostRecentCreatedTime = newMaxCreatedTime;
			}
		}
	})
}

getImagesAfterTime = function (created_time, callback) {
	var minKey = "(" + created_time;
	redis.zrangebyscore(ALLHASH_UNION_KEY,minKey,'+inf',callback);
}

getMaxCreatedTimeFromImages = function (media) {
	return Math.max.apply(Math, media.map(function (image) {
		return image.created_time;
	}));
}

getRecentImages = function (offset, limit, callback) {
	redis.zrevrange(ALLHASH_UNION_KEY, offset, limit, callback);
}

getDataFromURL = function (url, callback) {
	if (!(url && callback)) return;
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			if (callback) return callback(null, JSON.parse(body));
		}
		if (callback) return callback(error);
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
	if (!_.has(response, 'data')) return false;
	var media = response.data;
	if (media.length < 1) return false;
	return reduceMediaMetaData(media);
}

storeMediaDataToRedis = function (tag, media, callback) {
	if (!(tag && media)) return;
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
	if (!completionHandler) return;
	var hashSets = Object.keys(latestMinTagId);
	var unionArgs = [ALLHASH_UNION_KEY, hashSets.length];
	_.forEach(hashSets, function (hashtag) {
		unionArgs.push("hashtag:" + hashtag);
	});
	unionArgs.push("AGGREGATE");
	unionArgs.push("MAX");
	redis.zunionstore(unionArgs, completionHandler);
}

storeMinTagIdForResponse = function (tag, response) {
	if (!(tag && response && _.has(response, 'pagination'))) return;
	var newMinTagId = response.pagination.min_tag_id;
	if (newMinTagId) {
		redis.set("min_tag_id:hashtag:" + tag, newMinTagId);
		return latestMinTagId[tag] = newMinTagId;
	}
}

reduceMediaMetaData = function (media) {
	if (!media) return false;
	return _.map(media, function (image) {
		var keys = ['created_time','tags', 'location', 'link', 'likes', 'id',
								'type', 'videos', 'images','caption', 'user'];
		return _.pick(image, keys);
	});
}

exports.fetchNewMediaForTag = fetchNewMediaForTag;
exports.getRecentImages = getRecentImages;