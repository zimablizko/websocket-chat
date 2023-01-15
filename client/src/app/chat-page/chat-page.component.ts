import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { io } from 'socket.io-client';
import { SocketMessage, SocketMessageType } from '@common/types/message';
import { User, UserMap } from '@common/types/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesCont') messagesCont!: ElementRef;

  msgForm: FormGroup = this.fb.group({
    messageText: [''],
  });

  @Input() inputValue!: string;
  @Output() inputValueChange = new EventEmitter<string>();
  socket = io('ws://localhost:3000');
  username = '';

  messages: String[] = [];
  users: User[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.username =
      localStorage.getItem('socketchat_username') || this.changeUsername()!;
    //connect msg send
    const msg = this.createMessage(SocketMessageType.CONNECT_MSG, '');
    this.socket.emit(SocketMessageType.CONNECT_MSG, msg);

    this.socket.on(SocketMessageType.USER_MSG, (msg: SocketMessage) => {
      this.addMessage(msg);
    });

    this.socket.on(SocketMessageType.PAST_MSGS, (msgs: SocketMessage[]) => {
      console.log(msgs);
      for (const msg of msgs) {
        this.addMessage(msg);
      }
    });

    this.socket.on(SocketMessageType.USERS_LIST, (users: User[]) => {
      this.users = users;
      console.log(this.users);
    });
  }

  onSend() {
    const { messageText } = this.msgForm.getRawValue();
    if (messageText) {
      const msg = this.createMessage(SocketMessageType.USER_MSG, messageText);
      this.socket.emit(SocketMessageType.USER_MSG, msg);
      this.addMessage(msg);
      this.msgForm.reset();
    }
  }

  onChangeName() {
    this.username = this.changeUsername();
  }

  addMessage(msg: SocketMessage) {
    let content = '';
    if (msg.type === SocketMessageType.USER_MSG)
      content = `[${new Date(msg.createDate).toLocaleString('ru')}] ${
        msg.username
      }: ${msg.text}`;
    else if (msg.type === SocketMessageType.CONNECT_MSG)
      content = `[${new Date(msg.createDate).toLocaleString('ru')}] user ${
        msg.username
      } connected ❤️`;
    else if (msg.type === SocketMessageType.DISCONNECT_MSG)
      content = `[${new Date(msg.createDate).toLocaleString('ru')}] user ${
        msg.username
      } disconnected 😒`;
    this.messages.push(content);
  }

  createMessage(type: SocketMessageType, text: string): SocketMessage {
    return {
      type: type,
      text: text,
      username: this.username,
      createDate: Date.now(),
    };
  }

  changeUsername() {
    const oldName = localStorage.getItem('socketchat_username');
    const name = prompt('Enter your nickname:')!;
    console.log(oldName);
    if (oldName) {
      this.socket.emit(SocketMessageType.USERNAME_CHANGE, {
        oldUsername: oldName,
        newUsername: name,
      });
    }
    localStorage.setItem('socketchat_username', name);
    return name;
  }

  ngAfterViewChecked() {
    try {
      this.messagesCont.nativeElement.scrollTop =
        this.messagesCont.nativeElement.scrollHeight;
    } catch (err) {
      console.error(err);
    }
  }
}
