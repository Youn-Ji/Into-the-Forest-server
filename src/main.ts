import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'
import { config } from 'aws-sdk';
import { RedisIoAdapter } from './adapter/redis.adapter';
import { NestExpressApplication } from '@nestjs/platform-express'
import * as helmet from 'helmet';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_URL'),
    methods: ["GET", "POST", "OPTION"],
  });
  
  //app.use(helmet())
  //app.useWebSocketAdapter(new RedisIoAdapter(app));
  
  config.update({
    accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    region: configService.get('AWS_REGION')
  })

  await app.listen(4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
