"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express = require('express');
const app = express();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: true,
    },
});
const messages = [];
// app.use(express.static(__dirname + '/client'));
// app.get('/', (req: any, res: any) => {
//   res.sendFile(__dirname + '/clientd/index.html');
// });
io.on('connection', (socket) => {
    socket.emit('past messages', messages);
    socket.on('user connected', (msg) => {
        console.log('user connected: ', msg);
        io.emit('chat message', msg);
        messages.push(msg);
    });
    socket.on('chat message', (msg) => {
        console.log('message: ', msg);
        socket.broadcast.emit('chat message', msg);
        messages.push(msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
