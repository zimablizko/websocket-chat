export interface SocketMessage {
  type: SocketMessageType;
  text: string;
  username: string;
  createDate: number;
}

export interface UsernameChangeMessage {
  oldUsername: string;
  newUsername: string;
}

export enum SocketMessageType {
  USER_MSG = 'USER_MSG',
  PAST_MSGS = 'PAST_MSGS',
  USERS_LIST = 'USERS_LIST',
  CONNECT_MSG = 'CONNECT_MSG',
  DISCONNECT_MSG = 'DISCONNECT_MSG',
  USERNAME_CHANGE = 'USERNAME_CHANGE',
}
