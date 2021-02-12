import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize'

import { RankController } from './rank.controller';
import { RankService } from './rank.service';
import { Rank } from './rank.model'

@Module({
  imports: [SequelizeModule.forFeature([Rank])],
  controllers: [RankController],
  providers: [RankService],
  exports: [RankService]
})
export class RankModule {}
