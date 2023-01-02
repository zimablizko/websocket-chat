const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const messages = [];

app.use(express.static(__dirname + '/client'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

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
