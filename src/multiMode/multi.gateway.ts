import { 
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
import { Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket, Server } from 'socket.io'
import { MultiService } from './multi.service';
import { AuthService } from '../auth/auth.service';
import { RoomData, UserData } from './multi.interface'
import { RankService } from '../rank/rank.service'
import * as jwt from 'jsonwebtoken';

@WebSocketGateway()
export class MultiGateway implements OnGatewayDisconnect {
  private logger: Logger = new Logger('MultiGateway');

  @WebSocketServer() public server: Server;

  constructor (
    private multiService: MultiService,
    private authService: AuthService,
    private rankService: RankService,
    private configService: ConfigService){}

  @SubscribeMessage('access token') 
    async verifyClient(client: Socket, accessToken) {
      const { response, error } = this.authService.verifyClient(client.id, accessToken)
      if(response) {
        const { serverToken } = await this.authService.sign(client.id);
        if(accessToken) {
          this.server.to(client.id).emit('access token',  serverToken)
          this.logger.log(`[ 싱글모드]`)
          this.logger.log(`${client.id}님이 게임을 시작했습니다`)
          this.logger.log(`-------------------------------------------------`)
        }
      }
      if(error) {
        this.logger.log(`[ 인증실패]`)
        this.logger.log(`허가되지 않은 토큰입니다`)
        this.logger.log(`-------------------------------------------------`)
      }
    }

  @SubscribeMessage('load rank')
    async loadRank(client: Socket, data) {
      const { response, error } = this.authService.verifyServer(client.id, data.token)
      if(response) {
        const ranking = await this.rankService.load()
        if(ranking) {
          this.server.to(client.id).emit('load rank', ranking )
        }
      } 
      if(error) {
        this.logger.log(`[ 인증실패]`)
        this.logger.log(`허가되지 않은 토큰입니다`)
        this.logger.log(`-------------------------------------------------`)
      }
    }

    @SubscribeMessage('update rank')
    async updateRank(client: Socket, rankData) {
      const { token, data } = rankData
      const { response, error } = this.authService.verifyServer(client.id, token)
      if(response) {
        const rankAccess: any = jwt.verify(data, this.configService.get('SECRET_JWT_CONTENT'))
        if(rankAccess) {
          const { data, babo } = rankAccess;
            if(data.nickname !== ''
              && data.score >= 0
              && data.stage >= 0
              && data.subcha >= 0
              && babo === this.configService.get('DEEP_SECRET')) {
                await this.rankService.create(data);
                const newRanking = await this.rankService.load()
                if(newRanking) {
                  this.server.to(client.id).emit('update rank', newRanking)
                  this.logger.log(`[ 싱글모드]`)
                  this.logger.log(`${client.id}님이 닉네임${data.nickname}으로 ${data.score}점을 등록했습니다`)
                  this.logger.log(`-------------------------------------------------`)
                }
            } else {
              this.logger.log(`[ 에러]`)
              this.logger.log(`인자가 충분하지 않습니다`)
              this.logger.log(`-------------------------------------------------`)
            }
        }
      }
      if(error) {
        this.logger.log(`[ 인증실패]`)
        this.logger.log(`허가되지 않은 토큰입니다`)
        this.logger.log(`-------------------------------------------------`)
      }
    }

  @SubscribeMessage('create room')
  async createRoom(client: Socket, roomData: RoomData): Promise<object> {
    const { roomId, error } = await this.multiService.create(client.id, roomData)

    if(error) {
      return { error: error }
    }

    if(roomId) {
      client.join(roomId)
      return { clientId: client.id, roomId: roomId }
    }
  }

  @SubscribeMessage('join room')
  async joinRoom(client: Socket, userData: UserData): Promise<object> {
    const { roomId, error } = await this.multiService.join(client.id, userData)

    if(error) {
      return { error: error }
    }
    
    if(roomId) {
      client.join(roomId)
      return { clientId: client.id, roomId: roomId }
    }
  }

  @SubscribeMessage('user joined')
  async alertUser(client: Socket, userData) {
    const { roomId, error, data } = await this.multiService.alert(client.id, userData);
    if(error) {
      return { error: error }
    }

    if(roomId) {
      this.server.to(roomId).emit('user joined', data ) //신규 멤버 입장 알림
    }
  }
  
  @SubscribeMessage('set profile')
  setProfile(client: Socket, userData) {
    const { roomId, user } = this.multiService.setProfile(client.id, userData)

    if(user) {
      this.server.to(roomId).emit('set profile', user ) 
    }
  }
  
  @SubscribeMessage('chat')
  async chat(client: Socket, chatData) {
    const { roomId } = await this.multiService.chat(chatData)

    if(roomId) {
      this.server.to(roomId).emit('chat', { chat: chatData, clientId: client.id })
    }
  }

  @SubscribeMessage('sending signal')
  async sendSignal(client: Socket, data) {
    const { socketId, initiator, signal } = await this.multiService.send(client.id, data)
    this.server.to(socketId).emit('sending signal', { initiator, signal })
  }

  @SubscribeMessage('returning signal')
  async returnSignal(client: Socket, data) {
    const { socketId, returner, signal } = await this.multiService.return(client.id, data)
    this.server.to(socketId).emit('returning signal', { returner, signal })
  }

  @SubscribeMessage('send ready') 
  async sendReady(client: Socket, data) {
    const { response } = await this.multiService.sendReady(client.id, data)

    if(response.start) {
    this.server.to(response.socketId).emit('send ready', response)
    this.server.to(response.roomId).emit('ready check', client.id)
    }

    this.server.to(response.roomId).emit('ready check', client.id)
  }

  @SubscribeMessage('game start') 
  async gameStart(client: Socket, data) {
    const { response } = await this.multiService.gameStart(client.id, data)
    if(response.start) {
      this.server.to(response.roomId).emit('game start', response)
    }
  }

  @SubscribeMessage('send result') 
  async sendResult(client: Socket, gameResult) {
    const { response } = await this.multiService.sendResult(client.id, gameResult)
    if(response.userList) {
      this.server.to(response.roomId).emit('send result', response.userList)
    }
  }

  async afterInit(server: Server) {
    this.logger.log('Init');
  }
  
  async handleDisconnect(client: Socket) { //브라우저 창에서 x 눌렀을 때
    const { roomId, error, single } = await this.multiService.leave(client.id);

    if(error) {
      return { error: error }
    }

    if(roomId) {
      client.leave(roomId)
      this.server.to(roomId).emit('user leaved', { socketId : client.id }) //멤버 퇴장 알림
    }
    
    if(single) {
      return { single: single }
    }
  }

}
