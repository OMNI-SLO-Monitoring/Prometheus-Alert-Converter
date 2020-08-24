import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AlertConverterService } from './alert-converter/alert-converter.service';

@Module({
  imports: [ AlertConverterService ],
  controllers: [AppController],
  providers: [AppService, AlertConverterService],
})
export class AppModule {}
