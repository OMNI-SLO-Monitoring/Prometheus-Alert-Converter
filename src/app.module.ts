import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertConverterService } from './alert-converter/alert-converter.service';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [ AlertConverterService, ConfigModule.forRoot({isGlobal:true}) ],
  controllers: [AppController],
  providers: [AppService, AlertConverterService],
})
export class AppModule {}
