import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import * as data from './sample-alert.json'
import { LogMessageFormat } from 'logging-format';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    /**
     * Example to show converted Sample-Alerts into LogMessages.
     */
  @Get('/get-sample')
  async respondToRequest(): Promise<any> {       
    return this.appService.convertAlertToLogMessages(data);
  }

  /**
   * Endpoint for the Alert-Manager, incoming Alert will be converted and sent into the Queue.
   */
  @Post('post-alerts')
  addAlertsToConvert(@Body() alerts){     
    
    return this.appService.sendConvertedLogs(alerts);
  }

}
