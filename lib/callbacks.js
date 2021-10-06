// Dieses Objekt hält die Headerdaten eines Streams bereit
class headerData {
	
	constructor(hoehe, breite) {
		this.idrFrame = null;
		this.firstFrames = [];
	}
	
	getHeaderData() {
		if (!this.idrFrame) return [];
		return this.firstFrames.concat([this.idrFrame]);
	}

	setIdrFrame(frame) {
		this.idrFrame = frame.buffer.slice(frame.byteOffset, frame.byteOffset + frame.byteLength);
	}

    addParameterFrame(frame) {
        this.firstFrames.push(frame.buffer.slice(frame.byteOffset, frame.byteOffset + frame.byteLength));
    }

};

const callbacks = {};

// Login für Broadcaster
callbacks.broadcasterLogin = (objMessage, client, server) => {
			
	if (!objMessage.room) {
		console.log("room_id_missing");
		return client.send('{"type":"room_id_missing"}', false, false);
	} else if (!server.rooms[objMessage.room]) {
		console.log("room_not_found");
		return client.send('{"type":"room_not_found"}', false, false);
	} else if (server.rooms[objMessage.room].authCode !== objMessage.authCode) {
		console.log("room_authcode_wrong");
		return client.send('{"type":"room_authcode_wrong"}', false, false);
	}
	
	// Erlaube dem Client, in einen Raum zu streamen
	client.broadcast = objMessage.room;
	server.rooms[objMessage.room].broadcaster = client;
	server.rooms[objMessage.room].headerData = new headerData();
	
	// Sende dem Client die Erfolgsmeldung
	client.send('{"type":"room_authcode_accepted"}', false, false);
	
	console.log('Broadcaster betritt Raum "' + objMessage.room + '"');

}

// Betrete einen Raum
callbacks.room = (objMessage, client, server) => {
	
	if (!objMessage.room) {
		return client.send('{"type":"room_id_missing"}', false, false);
	} else if (!server.rooms[objMessage.room]) {
		return client.send('{"type":"room_not_found"}', false, false);
	}
	
	// Befindet sich der User bereits in einem Raum?
	if (client.room) {
		if (client.room === objMessage.room) return false;
		client.unsubscribe(client.room);
	}
	
	// Sende dem Client die Erfolgsmeldung
	client.send('{"type":"entered_the_room"}', false, false);

	// Sende die Headerdaten des Raums
	server.rooms[objMessage.room].headerData.getHeaderData().forEach(frame => {
		client.send(frame, true, true);
	});
		
	// Betrete den Raum
	client.room = objMessage.room;
	client.subscribe(objMessage.room);
		
	console.log('Client betritt Raum "' + objMessage.room + '"');

}

// Steuerung des Roboters
callbacks.controls = (objMessage, client, server) => {

	if (!client.room) {
		console.log("client_not_in_room");
		return client.send('{"type":"client_not_in_room"}', false, false);
	} else if (!server.rooms[client.room]) {
		console.log("room_doesnt_exist");
		return client.send('{"type":"room_doesnt_exist"}', false, false);
	} else if (!server.rooms[client.room].broadcaster) {
		console.log("room_not_active");
		return client.send('{"type":"room_not_active"}', false, false);
	}

	server.rooms[client.room].broadcaster.send(JSON.stringify(objMessage), false, false);

}

module.exports = callbacks;