const uws = require('uWebSockets.js');
const broadcasters = {};
const callbacks = require('./lib/callbacks.js');
const server = {
	rooms: {
		"robo1": {
			"authCode": "f7De!jo9fxHwkVc7h!fLtuM856Df32J9"
		}
	}
}

// Wandle BufferArray in Buffer zurück und erhalte ChunkType
const getChunk = (message) => {
	const buffer = Buffer.from(message);
	const type = buffer[4] & 0b11111;
	return {buffer, type};
}

// Konvertiere die Nachricht in ein Objekt
const parseMessageBuffer = (buf) => {
	const message = String.fromCharCode.apply(null, new Uint8Array(buf));
	try {
		return JSON.parse(message);
	} catch(e) {
		return {};
	}
}

// Broadcaster Daten
const broadcastData = (client, buffer) => {
	
	// Darf der Client senden?
	if (!client.broadcast) return;
	
	const chunk = getChunk(buffer);
	const headerData = server.rooms[client.broadcast].headerData;
	
	if (chunk.type === 7 || chunk.type === 8) {

		headerData.addParameterFrame(chunk.buffer);

	} else {
	
		client.publish(client.broadcast, buffer, true); // Sende Daten an alle clients außer dem Sender
		
		// Keep track of the latest IDR chunk, so we can start clients off with a near-current image
		if (chunk.type === 5) {
			headerData.setIdrFrame(chunk.buffer);
		}

	}

};

uws.App({
}).ws('/*', {

	idleTimeout: 600,
	maxPayloadLength: -1, // Schalte MaxPayloadLength ab

	open: (client, req) => {
		console.log('Client hat sich verbunden');
	},

	close: (client, req) => {
		console.log('Client hat die Verbindung getrennt');
		if (client.broadcast) server.rooms[client.broadcast].broadcaster = null;
	},

	message: (client, buffer, isBinary) => {

		const objMessage = isBinary ? false : parseMessageBuffer(buffer);
		
		if (!isBinary) {
			
			if (callbacks[objMessage.type]) callbacks[objMessage.type](objMessage, client, server);
			
		} else {
			
			// Sende Videodaten
			broadcastData(client, buffer);
			
		}
			
	}

}).listen(8080, (listenSocket) => {

	if (listenSocket) {
		console.log('Listening to port 8080');
	}

});