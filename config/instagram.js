var _ = require('lodash');
var keys = require('./keys.js');
var helper = require('./helpers.js')
var environment = require("./environment.js");
var ig = require('instagram-node').instagram();


var instagramTags = ['rave', 'edm', 'raver','techno'];

exports.setup = function () {
	ig.use(keys.instagram);

	// suscribe();
	// findSubscriptions();
	// deleteSubscriptions();
}

function suscribe () {
	_.forEach(instagramTags, function (tag) {
		if (!helper.isString(tag)) return;
		console.log('Subscribing to Instagram Tag: ' + tag);
		ig.add_tag_subscription(tag, environment.ngrok.url + "/pics", function(err, result, remaining, limit){
			console.log(result);
		});
	});
}

function deleteSubscriptions () {
	ig.del_subscription({ all: true }, function(err, subscriptions, remaining, limit){
		console.log(subscriptions);
	});
}

function findSubscriptions () {
	console.log('Finding Instagram Subscriptions');
	ig.subscriptions(function(err, result, remaining, limit){
		_.forEach(result, function (subscription) {
			console.log("Instagram Subscription: " + helper.objToJSON(subscription));
		});
	});
}