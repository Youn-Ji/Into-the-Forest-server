import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { v4 as uuid } from 'uuid';

import { RoomData, UserData, ChatData } from './multi.interface'

const rooms = {};
const users = {};

@Injectable()
export class MultiService {

  constructor(
    private readonly configService: ConfigService
  ) {}

  async create(hostId: string, roomData: RoomData) {
      const { roomCode, maxNum, nickName } = roomData
    
      if (roomCode in rooms) return {error: '방 이름이 중복됩니다.'} //룸코드 중복 검사 

      const roomId = uuid() // 신규 방 id 생성

      const newUser = { //신규 멤버 생성
        nickName: nickName,
        socketId: hostId,
        photoUrl: this.configService.get('PROFILE_PHOTO_URL'),
        roomCode: roomCode,
        isHost: hostId,
        gameResult: {}
      }
     
      const newRoom = { // 신규 방 생성 
        maxNum: maxNum, 
        roomId: roomId,
        userList: [newUser],
        ready:[],
        gameOver:[],
      }
      
      users[hostId] = newUser //유저 목록에 추가
      rooms[roomCode] = newRoom //방 목록에 추가
      console.log('신규방', rooms)
      return { roomId: roomId }
  }

  async join(hostId: string, userData: UserData) {
    const { roomCode, nickName } = userData
    if (!(roomCode in rooms)) return {error: '찾으시는 방이 없습니다 ㅠㅠ'};

    const { userList, roomId, maxNum } = rooms[roomCode];
    const isRoomFull = list => list.length >= maxNum;
    console.log('userList', userList)
    if (isRoomFull(userList)) return {error: '방이 꽉 찼어요!'}

    const newUser = { 
      nickName: nickName,
      socketId: hostId,
      photoUrl: this.configService.get('PROFILE_PHOTO_URL'),
      roomCode: roomCode,
      gameResult: {}
    }
    
    users[hostId] = newUser; //유저 목록에 추가
    userList.push(newUser); //기존 방에 신규멤버 추가
    console.log('신규멤버',userList)
  
    return { roomId: roomId } 
  }

  async alert(hostId: string, userData) {
    if(!(userData in rooms)) return {error: '방이 없군여!'}
    const { roomId, userList } = rooms[userData]

    // const index = userList.findIndex(user => user.clientId === hostId)
    // const user = userList[index]

    const data = { 
      clientId: hostId, 
      userList: userList }
    
    return { roomId: roomId, data: data }
  }

  setProfile(hostId: string, userData) {
    const { roomCode } = userData;
    const { userList, roomId } = rooms[roomCode];
  
    const index = userList.findIndex(user => user.socketId === hostId)
    const user = userList[index]
   
    if(userData.nickName) user.nickName = userData.nickName;
    if(userData.photoUrl) user.photoUrl = userData.photoUrl;
    console.log(user)

    return { roomId: roomId, user: user }
  }

  async leave(hostId: string) { //브라우저 창에서 x 눌렀을 때 
    const { roomCode } = users[hostId];
    const { userList, roomId } = rooms[roomCode];
    if(roomCode in rooms) {
      const index = userList.findIndex(user => user.socketId === hostId)

      userList.splice(index, 1); //룸 멤버 목록에서 삭제
      delete users[hostId] //전체 유저 목록에서 삭제
      console.log(hostId,'님이 떠나셨습니다..')
      if(userList.length === 0) {
        delete rooms[roomCode]
        console.log('모두 나감')
      }
      console.log(rooms[roomCode])
      console.log(users)
      return { roomId : roomId }
    } else {
      return { error : '룸이 없어요'}
    }
  }

  async chat(chatData) {
    const { roomCode, chat } = chatData;
    const { roomId } = rooms[roomCode];
    console.log(roomCode, chat.nickName, chat.content)
    return { roomId : roomId }
  }

  async send(hostId: string, data) {
    const { roomCode, signal, receiver } = data;
    const { userList } = rooms[roomCode]

    const index = userList.findIndex(user => user.socketId === hostId)
    const initiator = userList[index];
    const socketId = receiver.socketId;
    
    return { initiator: initiator, socketId: socketId, signal: signal }
  }

  async return(hostId: string, data) {
    const { roomCode, signal, receiver } = data;
    const { userList } = rooms[roomCode]

    const index = userList.findIndex(user => user.socketId === hostId)
    const returner = userList[index];
    const socketId = receiver.socketId;
    return { returner: returner, socketId: socketId, signal: signal }
  }
  
  async sendReady(hostId: string, roomCode) {
    const{ userList, roomId } = rooms[roomCode]

    rooms[roomCode].ready.push('ready');
    
    if(rooms[roomCode].ready.length === 4) {
      rooms[roomCode].ready.length = 0;
      return {response: { socketId: userList[0].isHost, roomId: roomId, start: 'start' }}
    }
    
    return {response: { socketId: userList[0].isHost, roomId: roomId }}
  }

  async gameStart(hostId: string, roomCode) {
    const{ roomId } = rooms[roomCode];
    return {response: {roomId: roomId, start: 'real start'}}
  }

  async sendResult(hostId: string, gameResult) {
    const{ roomCode, result } = gameResult
    const{ roomId, userList, gameOver } = rooms[roomCode]
    
    const index = userList.findIndex(user => user.socketId === hostId)
    userList[index].gameResult = {
      ...result,
    }
  
    gameOver.push(hostId)
    console.log('count',gameOver)
    
    if(gameOver.length === 4) {
      console.log('gameover')
      return {response: {roomId: roomId, userList: userList}}
    }

    return {response: {roomId: roomId}}
  }
}
