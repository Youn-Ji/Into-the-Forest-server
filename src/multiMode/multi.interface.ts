export interface RoomData {
  roomCode: string;
  maxNum: number;
  nickName: string;
}

export interface UserData {
  roomCode: string;
  nickName: string;
}

export interface ChatData {
  roomCode: string;
  chat: object;
}