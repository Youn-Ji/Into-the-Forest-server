// import { Controller, UseInterceptors, UploadedFile, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
// import { RecordService } from './record.service'
// import { FileInterceptor } from '@nestjs/platform-express'

// @Controller('record')
// export class RecordController {
//   constructor(
//     private recordServie: RecordService
//   ) {}

//   @Post('reg')
//   @UseInterceptors(FileInterceptor('file'))
//   create(
//     @Body('roomcode') roomcode: string, 
//     @Headers('password') password: string, 
//     @UploadedFile() file) {
//       if(roomcode && password && file) {
//         return this.recordServie.create(
//           roomcode, 
//           password, 
//           file.buffer, 
//           file.originalname)
//       } else {
//         throw new HttpException(
//           'Insufficient parameters', 
//           HttpStatus.BAD_REQUEST);
//       }
//   }

//   @Post('load')
//   findOne(
//     @Body('roomcode') roomcode: string, 
//     @Headers('password') password: string) {
//     if(roomcode && password) {
//       return this.recordServie.findOne(roomcode, password)
//     } else {
//       throw new HttpException(
//         'Insufficient parameters',
//         HttpStatus.BAD_REQUEST);
//     }
//   }
// }
