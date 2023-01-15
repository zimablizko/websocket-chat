import { SocketMessage, SocketMessageType, UsernameChangeMessage } from '../../_common/types/message';
import { User, UserMap } from '../../_common/types/user';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const express = require('express');
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
  },
});
const messages: SocketMessage[] = [];
let userMap: UserMap = {};

io.on('connection', (socket: Socket) => {
  socket.emit(SocketMessageType.PAST_MSGS, messages);

  socket.on(SocketMessageType.CONNECT_MSG, (msg: SocketMessage) => {
    const user: User = {
      name: msg.username,
    };
    console.log('user connected', msg.username);
    userMap[socket.id] = user;
    io.emit(SocketMessageType.USER_MSG, msg);
    console.log('usermap', userMap);
    const userList = Object.values(userMap);
    io.emit(SocketMessageType.USERS_LIST, userList);
    messages.push(msg);
  });

  socket.on(SocketMessageType.USER_MSG, (msg: SocketMessage) => {
    console.log('message: ', msg);
    socket.broadcast.emit(SocketMessageType.USER_MSG, msg);
    messages.push(msg);
  });

  socket.on(SocketMessageType.USERNAME_CHANGE, (msg: UsernameChangeMessage) => {
    console.log('message: ', msg);
    userMap[socket.id].name = msg.newUsername;
    const userList = Object.values(userMap);
    io.emit(SocketMessageType.USERS_LIST, userList);
  });

  socket.on('disconnect', () => {
    const map: UserMap = {};
    for (const [key, value] of Object.entries(userMap)) {
      if (key !== socket.id) {
        map[key] = value;
      }
    }
    userMap = map;
    console.log('user disconnected', socket.id);
    const userList = Object.values(userMap);
    io.emit(SocketMessageType.USERS_LIST, userList);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
