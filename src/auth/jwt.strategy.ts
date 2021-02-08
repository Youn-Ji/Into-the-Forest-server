import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { jwtConstants } from './constants'
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';


@Injectable() 
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SECRET_JWT'),
    });
  }

  async validate(key: string): Promise<any> {
    const user = await this.authService.validate(key);
    if(!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

