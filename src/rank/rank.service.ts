import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RankInt } from './interfaces/rank.interface';
import { Rank } from './rank.model'

@Injectable()
export class RankService {
  readonly SECRET_CODE: string;

  constructor(
    @InjectModel(Rank)
    private rank: typeof Rank,
  ) {
    this.SECRET_CODE = 'shelter';
  }
  
  async load() { 
    const ranking = await this.rank.findAll({
      order: [['score', 'DESC']],
      attributes: { exclude: ['id', 'updatedAt']}
    })
    
    if(ranking) {
      return ranking
    } else {
      throw new HttpException(
        'Rank does not exist',
        HttpStatus.NOT_FOUND);
    }
  }

  async create(rank: RankInt) {
    if(rank.score >= 60000) {
      throw new HttpException(
        'Wrong access',
        HttpStatus.FORBIDDEN);
    } else {
      const ranking = await this.rank.create({
        nickname: rank.nickname,
        score: rank.score,
        stage: rank.stage,
        subcha: rank.subcha
      })
      return await Object.assign({
        message: 'ok' });
    }
  }
}
