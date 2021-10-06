const express = require('express');
const http = require("http");
const path = require('path');

const app = express();
const httpServer = http.createServer(app);

app.get('/', function (req, res) {
    res.sendFile(path.resolve('index.html'));
});

app.get('/stream', function (req, res) {
    res.setHeader('transfer-encoding', 'chunked');
    setInterval(function(){
        res.write('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    },1);
});

httpServer.listen(8080);