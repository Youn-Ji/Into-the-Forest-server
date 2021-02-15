import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { v4 as uuid } from 'uuid';

import { RoomData, UserData } from './multi.interface'

const rooms = {};
const users = {};

@Injectable()
export class MultiService {
  private logger: Logger = new Logger('MultiService');

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
      this.logger.debug(`[ 신규방 생성]`)
      this.logger.debug(`방이름:${roomCode} | 최대인원수:${maxNum} | 생성자:${nickName}`)
      this.logger.debug(`-------------------------------------------------`)
      return { roomId: roomId }
  }
 
  async join(hostId: string, userData: UserData) {
    const { roomCode, nickName } = userData
    if (!(roomCode in rooms)) return {error: '찾으시는 방이 없습니다 ㅠㅠ'};

    const { userList, roomId, maxNum } = rooms[roomCode];
    const isRoomFull = list => list.length >= maxNum;

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
    this.logger.debug(`[ 신규멤버]`)
    this.logger.debug(`방이름:${roomCode} | 닉네임:${nickName}`)
    this.logger.debug(`-------------------------------------------------`)
  
    return { roomId: roomId } 
  }

  async alert(hostId: string, userData) {
    if(!(userData in rooms)) return {error: '방이 없군여!'}
    const { roomId, userList } = rooms[userData]

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
    this.logger.debug(`[ 프로필 수정]`)
    this.logger.debug(`닉네임:${user.nickName} | 사진:${user.photoUrl}`)
    this.logger.debug(`-------------------------------------------------`)

    return { roomId: roomId, user: user }
  }

  async leave(hostId: string) { //브라우저 창에서 x 눌렀을 때 
    if(!users[hostId]) {
      return { single : `${hostId} 님이 떠나셨습니다.. `}
    }
    const { roomCode, nickName } = users[hostId];
    const { userList, roomId } = rooms[roomCode];
    if(roomCode in rooms) {
      const index = userList.findIndex(user => user.socketId === hostId)

      userList.splice(index, 1); //룸 멤버 목록에서 삭제
      delete users[hostId] //전체 유저 목록에서 삭제
      this.logger.log(`${nickName}님이 ${roomCode}방을 떠났습니다`)
      this.logger.log(`-------------------------------------------------`)

      if(userList.length === 0) {
        delete rooms[roomCode]
        this.logger.log(`${roomCode}방의 멤버가 모두 나갔습니다`)
        this.logger.log(`-------------------------------------------------`)
      }
      
      return { roomId : roomId }
    } else {
      return { error : '룸이 없어요'}
    }
  }

  async chat(chatData) {
    const { roomCode, chat } = chatData;
    const { roomId } = rooms[roomCode];
    this.logger.verbose(`[ 채팅/${roomCode} ] ${chat.nickName}:${chat.content}`)
    this.logger.verbose(`-------------------------------------------------`)
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
    
    if(gameOver.length === 4) {
      this.logger.debug(`[ 멀티방 게임 종료] ${roomCode}`)
      this.logger.debug(`-------------------------------------------------`)
      return {response: {roomId: roomId, userList: userList}}
    }

    return {response: {roomId: roomId}}
  }
}
