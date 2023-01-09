import { Socket } from 'socket.io';
import { Message } from '../../_common/types/message';
import { createServer } from 'http';
import { Server } from 'socket.io';

const express = require('express');
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
  },
});
const messages: Message[] = [];

// app.use(express.static(__dirname + '/client'));

// app.get('/', (req: any, res: any) => {
//   res.sendFile(__dirname + '/clientd/index.html');
// });

io.on('connection', (socket: Socket) => {
  socket.emit('past messages', messages);

  socket.on('user connected', (msg: Message) => {
    console.log('user connected: ', msg);
    io.emit('chat message', msg);
    messages.push(msg);
  });

  socket.on('chat message', (msg: Message) => {
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
