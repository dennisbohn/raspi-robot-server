const fs = require('fs');
const path = require('path');
const rand = require('generate-key');
const crypto = require('crypto');
const sha256 = x => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

module.exports = class Database {

    constructor(options) {

        // Dateiname zur Datenbank-Datei
        const filename = path.join(__dirname, '../db', options.db.name + '.json');

        // Existiert die Datei?
        if (fs.existsSync(filename)) {

            // Erstelle eine neue Datei
            fs.writeFileSync(filename, '{"activeKeys":{}}');

        }

        // Parse die Datei
        if (fs.existsSync(filename)) {
            this.db = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        } else {
            this.db = {};
            fs.writeFileSync(filename, JSON.stringify(this.db));
        }

        this.filename = filename;
        this.options = options;

    }

    updateRooms(rooms) {

        var changed = false;

        // Füge einen Raum zur Konfiguration hinzu, falls dieser fehlt
        rooms.forEach(room => {
            if (!this.db[room]) {

                this.db[room] = {
                    "activeKeys": {}
                }

                changed = true;
            }
        });

        // Speichere, falls sich etwas geändert hat
        if (changed) this.save();

    }

    generateEmailHash(email) {
        return sha256(email.trim().toLowerCase());
    }

    // Prüfe, ob bereits ein Key für einen E-Mail-Hash vorhanden ist
    findKeyForEmailHash(emailHash, room) {

        for (var key in this.db[room].activeKeys) {
            if (this.db[room].activeKeys[key].emailHash === emailHash) return key;
        }

        return false;

    }

    // Fügt die E-Mail-Adresse ins System ein
    addEmailToActiveKeys(email, room) {

        // Generiere einen Key, der für die Session verwendet wird
        const emailHash = this.generateEmailHash(email);

        // Prüfe, ob für den emailHash bereits ein Key vorliegt
        var key = this.findKeyForEmailHash(emailHash, room);

        // Gib den Key zurück, falls bereits einer existiert
        if (key) return key;

        // Andernfalls generiere einen neuen Key
        key = rand.generateKey(32);

        // Trage Zeit und Key ins Queue-Objekt ein
        this.db[room].activeKeys[key] = {
            requestTime: Date.now(),
            emailHash: emailHash
        };

        // Speichere den Eintrag
        this.save();

        return key;

    }

    // Finde einen Raum anhand des Keys
    findRoomByKey(userKey) {

        for (room in this.db) {
            for (key in this.db[room].activeKeys) {
                if (key === userKey) return room;
            }
        }

        return false;
    }

    // Finde das nächste Zeitfenster
    findNextControlTime(room) {

        const times = [];
        var startTime;

        for (var key in this.db[room].activeKeys) {
            if (this.db[room].activeKeys[key].time) times.push(this.db[room].activeKeys[key].time);
        }

        // Sortiere das Array absteigend
        times.sort().reverse();

        // Gehe die Zeiten durch
        for (var i=0; i<times.length; i++) {
            if (i == 0) startTime = times[i] + 
        }

    }

    // Setze den Steuerzeitpunkt
    setControlTimeForKey(key) {

        const room = this.findRoomByKey();

    }

    save() {

        // Speichere die Datei
        fs.writeFileSync(this.filename, JSON.stringify(this.db));

    }

}