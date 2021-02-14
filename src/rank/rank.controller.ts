import { Controller, Get, Post, Body, HttpException, HttpStatus, UseGuards, Logger } from '@nestjs/common';
import { RankService } from './rank.service';
import { RankDto } from './dto/rank.dto';
import { RankInt } from './interfaces/rank.interface';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config'
import * as jwt from 'jsonwebtoken';

@Controller('rank')
export class RankController {
  private logger: Logger = new Logger('RankController')
  constructor(
    private rankService: RankService,
    private configService: ConfigService) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Get('load')
  load() {
    return this.rankService.load();
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Post('reg')
  async create(@Body() regData: any) {
    const rankAccess: any = await jwt.verify(regData.rankToken, this.configService.get('SECRET_JWT_CONTENT'))

    if(rankAccess) {
      const { data, babo } = rankAccess
      
      if(data.nickname !== ''
        && data.score >= 0
        && data.stage >= 0
        && data.subcha >= 0
        && babo === this.configService.get('DEEP_SECRET')) {
          this.logger.log(`${data.nickname}님이 ${data.score}점을 등록하셨습니다`)
          return this.rankService.create(data);
      } else {
        throw new HttpException(
          'Insufficient parameters',
          HttpStatus.BAD_REQUEST);
      }
    }
  }
}
