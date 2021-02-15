import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize'
import { RankService } from './rank.service';
import { Rank } from './rank.model'

@Module({
  imports: [SequelizeModule.forFeature([Rank])],
  providers: [RankService],
  exports: [RankService]
})
export class RankModule {}
