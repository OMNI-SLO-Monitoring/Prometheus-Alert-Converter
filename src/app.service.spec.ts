import { Test, TestingModule } from '@nestjs/testing';
import { LogMessageFormat, LogType } from "logging-format";
import { AlertConverterService } from './alert-converter/alert-converter.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as data from './sample-alert.json';

/**
 * Tests for converting an Alert from Prometheus to own LogFormat 
 */
describe('AppService', () => {
    let appService: AppService;

    const log: LogMessageFormat = {
        type: LogType.CPU,
        time: 1533282746739,
        source: "http://localhost:9182/metrics",
        detector: "http://localhost:9090/",
        message: "CPU load is > 80%\n  VALUE = 33.8872230551391\n LABELS: map[instance:localhost:9182]",
        data: {
            cpuUtilization: 33,
        },
    };

    let logs: LogMessageFormat[] = [];
    logs.push(log);

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AlertConverterService],
            controllers: [AppController],
            providers: [AppService, AlertConverterService],
        }).compile();

        appService = app.get<AppService>(AppService);
    });

    describe('Convert Test', () => {
        it('should convert a Alert in a LogFormat object', () => {
            expect(appService.convertAlertToLogMessages(data)).toMatchObject(logs);
        });
    });
});
