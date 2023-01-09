import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { io } from 'socket.io-client';
import { Message } from '../../../../_common/types/message';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit {
  @Input() inputValue!: string;
  @Output() inputValueChange = new EventEmitter<string>();
  form = document.getElementById('form')!;

  changeNameBtn = document.getElementById('nameBtn')!;
  messages_container = document.getElementById('messages')!;
  socket = io('ws://localhost:3000');
  username =
    localStorage.getItem('socketchat_username') || this.changeUsername()!;
  messages: String[] = [];

  // constructor() {}

  ngOnInit(): void {
    //connect msg send
    const msg = this.createMessage('CONNECT_MSG', '');
    this.socket.emit('user connected', msg);

    this.socket.on('chat message', (msg: Message) => {
      this.addMessage(msg);
    });

    this.socket.on('past messages', (msgs: Message[]) => {
      console.log(msgs);
      for (const msg of msgs) {
        this.addMessage(msg);
      }
    });
  }

  onSend() {
    if (this.inputValue) {
      const msg = this.createMessage('USER_MSG', this.inputValue);
      this.socket.emit('chat message', msg);
      this.addMessage(msg);
      this.inputValue = '';
    }
  }

  onChangeName() {
    this.changeUsername();
  }

  addMessage(msg: Message) {
    let content = '';
    if (msg.type === 'USER_MSG')
      content = `[${new Date(msg.createDate).toLocaleString('ru')}] ${
        msg.username
      }: ${msg.text}`;
    else if (msg.type === 'CONNECT_MSG')
      content = `[${new Date(msg.createDate).toLocaleString('ru')}] user ${
        msg.username
      } connected ❤️`;
    else if (msg.type === 'DISCONNECT_MSG')
      content = `[${new Date(msg.createDate).toLocaleString('ru')}] user ${
        msg.username
      } disconnected 😒`;
    this.messages.push(content);
  }

  createMessage(type: string, text: string): Message {
    return {
      type: type,
      text: text,
      username: this.username,
      createDate: Date.now(),
    };
  }

  changeUsername() {
    const name = prompt('Enter your nickname:')!;
    localStorage.setItem('socketchat_username', name);
    this.username = name;
    console.log(this.username);
  }
}
