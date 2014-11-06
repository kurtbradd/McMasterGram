// create static controller
// create instagram hooks controller (pass in socket.io)
// when declaring each route, return the api endpoint string so can be used in other parts of the app....export
// so whole module does not have to be used

// declare routes

exports.routes = {
	// Routes used by Instagram
	instagram: {
		hooks: {
			getPics: '/pics',
			postPics: '/pics'
		},
		authorization: {}
	},
	// Static Assets Routes
	staticAssets: {
		catchAll: '*'
	}
}