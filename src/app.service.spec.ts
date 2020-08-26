import { Test, TestingModule } from '@nestjs/testing';
import { AlertConverterService } from './alert-converter/alert-converter.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogMessageFormat, LogType } from "logging-format";
import  *  as  data  from  './sample-alert.json';

/**
 * Tests for converting a Alert from Prometheus to own LogFormat 
 */
describe('AppService', () => {
    let appService: AppService;
    
    

    const log: LogMessageFormat = {
        type: LogType.CPU,
        time: 1533282746739,
        source: null,
        detector: 'Prometheus',
        message: "Expected CPU utilization < 80% , got 85 %for http://localhost:3000",
        data: {
            cpuUtilization: 0,
        },
    };

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AlertConverterService ],
            controllers: [AppController],
            providers: [AppService, AlertConverterService],
        }).compile();

        appService = app.get<AppService>(AppService);
    });

    describe('Convert Test', () => {
        it('should convert a Alert in a LogFormat object', () => {
            expect(appService.convertAlertToLogMessages(data)[0]).toMatchObject(log);
        });
    });
});
