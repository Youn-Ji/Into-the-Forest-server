import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken';

@Injectable() 
export class AuthService {
  constructor (
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async sign() {
    const payload = { key: this.configService.get('SECRET_PAYLOAD') };
    return {
      accessToken: this.jwtService.sign(payload)
    }
  }

  async verify(hostId, token) {
    let accessToken = jwt.verify(token, this.configService.get('SECRET_JWT_TEMP'))
    if(accessToken === hostId) {
      return { response: 'ok'}
    } else {
      return { error: 'error'}
    }
  }

  async verifyGuard(accessToken) {
    if(accessToken === this.configService.get('SECRET_PAYLOAD')) {
      return { response: 'ok'}
    } else {
      return { error: 'error'}
    }
  }
}