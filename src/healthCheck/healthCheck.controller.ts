import { Controller, UseInterceptors, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'
import { FileService } from '../record/file.service'



@Controller('healthCheck')
export class HealthCheckController {
  private logger: Logger = new Logger('healthCheck')

  constructor(
    private readonly fileService: FileService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(201)
  async image(@Body() reqData: any){
    await this.fileService.uploadFile(reqData.data, '.jpg')
  }
}
