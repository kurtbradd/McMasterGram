var _ = require('lodash');

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