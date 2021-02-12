import { Module } from '@nestjs/common';
import { HealthCheckController } from './healthCheck.controller';
import { FileService } from '../record/file.service'

@Module({
  controllers: [HealthCheckController],
  providers: [FileService]
})
export class HealthCheckModule {}
