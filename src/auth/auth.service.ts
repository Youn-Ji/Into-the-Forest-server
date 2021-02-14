import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'

import * as jwt from 'jsonwebtoken';

@Injectable() 
export class AuthService {
  constructor (
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sign(hostId) {
    const payload = { hostId: hostId };
    return {
      serverToken: this.jwtService.sign(payload)
    }
  }

  verifyClient(hostId, token) {
    try {
      const accessToken: any = jwt.verify(token, this.configService.get('SECRET_JWT_TEMP'))
      if(accessToken === hostId) {
        return { response: 'ok'}
      }
    } catch(err) {
      return { error: 'error'}
    }
  }


  verifyServer(hostId, token) {
    try {
    const serverToken: any = jwt.verify(token, this.configService.get('SECRET_JWT'))
    if(serverToken.hostId === hostId) {
      return { response: 'ok' }
      } 
    } catch (err) {
      return { error: 'error' }
    }
  }

  async verifyGuard(data) {
    if(data.key === this.configService.get('SECRET_PAYLOAD')) {
      return 'ok'
    } else {
      return null
    }
  }
}