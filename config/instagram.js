var keys = require('./keys.js');
var ig = require('instagram-node').instagram();

exports.setup = function () {
	ig.use({ client_id: 		keys.instagram.clientId,
         	client_secret: 	keys.instagram.clientSecret});

	ig.subscriptions(function(err, subscriptions, remaining, limit){
  	console.log(subscriptions);
  	console.log(remaining);
  	console.log(limit);
	});

	suscribe();
}

function suscribe () {
	console.log('suscribe');
	ig.add_tag_subscription('#love', 'http://9f66a41.ngrok.com/pics', function(err, result, remaining, limit){
		console.log(result);
	});
}