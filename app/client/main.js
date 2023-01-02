const form = document.getElementById('form');
const input = document.getElementById('input');
const changeNameBtn = document.getElementById('nameBtn');
const messages_container = document.getElementById('messages');

let username = localStorage.getItem('socketchat_username');
if (username === null) {
  changeUsername();
}

const socket = io();
const msg = createMessage('CONNECT_MSG', '');
socket.emit('user connected', msg);

changeNameBtn.addEventListener('click', function (e) {
  e.preventDefault();
  changeUsername();
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    const msg = createMessage('USER_MSG', input.value);
    socket.emit('chat message', msg);
    addMessage(msg);
    input.value = '';
  }
});

socket.on('chat message', function (msg) {
  addMessage(msg);
});

socket.on('past messages', function (msgs) {
  console.log(msgs);
  for (const msg of msgs) {
    addMessage(msg);
  }
});

function addMessage(msg) {
  const item = document.createElement('li');
  console.log(msg);
  if (msg.type === 'USER_MSG')
    item.textContent = `[${new Date(msg.createDate).toLocaleString('ru')}] ${msg.username}: ${msg.text}`;
  else if (msg.type === 'CONNECT_MSG')
    item.textContent = `[${new Date(msg.createDate).toLocaleString('ru')}] user ${msg.username} connected ❤️`;
  else if (msg.type === 'DISCONNECT_MSG')
    item.textContent = `[${new Date(msg.createDate).toLocaleString('ru')}] user ${msg.username} disconnected 😒`;
  messages_container.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function createMessage(type, text) {
  return {
    type: type,
    text: text,
    username: username,
    createDate: Date.now(),
  };
}

function changeUsername() {
  const name = prompt('Enter your nickname:');
  localStorage.setItem('socketchat_username', name);
  username = name;
  console.log(username);
}
