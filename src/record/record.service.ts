// import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
// import { InjectModel } from '@nestjs/sequelize'
// import { FileService } from './file.service'
// import { Record } from './record.model'

// @Injectable()
// export class RecordService {
//   constructor(
//     @InjectModel(Record)
//     private record: typeof Record,
//     private readonly fileService: FileService
//   ) {
//   }

//   async create(roomcode: string, password: string, imageBuffer: Buffer, filename: string) {
//     const upload = await this.fileService.uploadFile(imageBuffer, filename);
//     const record = await this.record.create({
//       roomcode: roomcode,
//       password: password,
//       url: upload.url,
//       key: upload.key });

//       return Object.assign({
//         message: 'ok'})
//   }

//   async findOne(roomcode: string, password: string) {
//     const record = await this.record.findAll({ 
//       where: { roomcode: roomcode, password: password },
//       attributes: { exclude: ['id', 'password', 'updatedAt']}});
    
//     if(record.length !== 0) {
//       return record
//     } else {
//       throw new HttpException(
//         'Record with this room code or password does not exist', 
//         HttpStatus.NOT_FOUND);
//     }
//   }
// }
