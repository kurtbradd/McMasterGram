var _ = require('lodash');
var crypto = require('crypto');
var bodyParser = require('body-parser')

exports.isString = function (string) {
	return (typeof string == 'string' || string instanceof String);
}

exports.objToJSON = function (object) {
	return JSON.stringify(object, null, 4);
}

exports.arrayDifferenceById = function (array1, array2) {
	var diff = _.difference(_.pluck(array1, "id"), _.pluck(array2, "id"));
	return _.filter(array1, function(obj) {
		return diff.indexOf(obj.id) >= 0;
	});
}

exports.encodeNonUTF8String = function (string) {
	return unescape(encodeURIComponent(string));
}

exports.decodeNonUTF8String = function (string) {
	return decodeURIComponent(escape(string));
}

exports.sha1Digest = function (key, data, encoding) {
	if (!(key && data)) return false;
	return crypto
	.createHmac('sha1', key)
	.update(data)
	.digest(encoding || 'hex')
}

exports.rawBodyParser = bodyParser.json({
	verify: function (req, res, buf) {
		req.rawBody = buf;
	}
})