console.log('Instagram Controller Loaded');

module.exports = {
	postPics: function (socketio) {
		return function (req, res) {
			// if (req.body[0].object_id) {
			// 	pic = req.body[0]
			// 	console.log('got it')
			// 	var url = 'https://api.instagram.com/v1/tags/' + pic.object_id
	 		//     + '/media/recent?client_id=479edbf0004c42758987cf0244afd3ef';
			//   sockets.emitNewPic(url);
			// }
			return res.send(200, "Success");
		}
	},
	getPics: function (req, res) {
		console.log(req.query['hub.challenge']);
		return res.send(200,req.query['hub.challenge']);
	}

}