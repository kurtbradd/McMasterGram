# _McMasterGram_

_Web interface that displays all Instagram media that has been location tagged, geo-tagged, or hash-tagged in relation to McMaster University. New media is received by subscribing to the Instagram Real-time API, and then pushed to the user via WebSockets._

## Dependencies

1. Node.js
2. Redis
3. Ngrok

## Project Setup

_To run application, follow these steps._

### Locally 

1. Add 'keys.js' to _/config_ folder

```javascript
module.exports = {
	instagram: {
		'client_id': '78d37ee2da164a1fb8f6b4da83a5b9f1',
		'client_secret':'2af8cc97b4304a9c8f4e7f3986cc1f12'
	}
}
```

2. Configure 'environment.js' accordingly
3. Start ngrok ex. './ngrok 3000', to run on port 3000

## Testing

_TODO_

## TODO

1. Add grunt script for ngrok
2. Add grunt script for remote deployment
3. Implement React.js for quicker DOM insertions
4. Testing API Endpoints