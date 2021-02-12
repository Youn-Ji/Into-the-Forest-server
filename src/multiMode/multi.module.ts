import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { RankModule } from 'src/rank/rank.module';
import { MultiGateway } from './multi.gateway';
import { MultiService } from './multi.service';

@Module({
  imports: [AuthModule, RankModule],
  controllers: [],
  providers: [MultiGateway, MultiService]
})
export class MultiModule {}
