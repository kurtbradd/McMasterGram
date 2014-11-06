exports.isString = function (string) {
	return (typeof string == 'string' || string instanceof String);
}

exports.objToJSON = function (object) {
	return JSON.stringify(object, null, 4);
}