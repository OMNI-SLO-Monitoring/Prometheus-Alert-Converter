import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as data from './sample-alert.json'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/get-sample')
  async respondToRequest(): Promise<any> {
       
    return this.appService.convertAlertToLogMessages(data);
  }
 
}
