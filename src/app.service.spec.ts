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

    const log0: LogMessageFormat = {
        type: LogType.CPU,
        time: 1533282746739,
        sourceUrl: "http://localhost:9182/metrics",
        detectorUrl: "http://localhost:9090/",
        message: "CPU load is > 80%\n  VALUE = 33.8872230551391\n LABELS: map[instance:localhost:9182]",
        data: {
            cpuUtilization: 33,
        },
    };

    const log1: LogMessageFormat = {
        type: LogType.TIMEOUT,
        time: 1533282746739,
        sourceUrl: "http://localhost:9182/metrics",
        detectorUrl: "http://localhost:9090/",
        message: "Price-Service not reachable for 5 seconds",
        data: {
            timeoutDuration: 0,
        },
    };

    const log2: LogMessageFormat = {
        type: LogType.ERROR,
        time: 1533282746739,
        sourceUrl: "http://localhost:9182/metrics",
        detectorUrl: "http://localhost:9090/",
        message: "Incorrect response from Price-Service",
        data: null,
    };

    const log3: LogMessageFormat = {
        type: LogType.CB_OPEN,
        time: 1533282746739,
        sourceUrl: "http://localhost:9182/metrics",
        detectorUrl: "http://localhost:9090/",
        message: "Circuit-Breaker open at Price-Service",
        data: null,
    };

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AlertConverterService],
            controllers: [AppController],
            providers: [AppService, AlertConverterService],
        }).compile();

        appService = app.get<AppService>(AppService);
    });

    describe('Convert HighCpuLoad-Alert Test', () => {
        it('should convert a Alert in a LogFormat object', () => {
            expect(appService.convertAlertToLogMessages(data)[0]).toMatchObject(log0);
        });
    });

    describe('Convert TimeOut-Alert Test', () => {
        it('should convert a Alert in a LogFormat object', () => {
            expect(appService.convertAlertToLogMessages(data)[1]).toMatchObject(log1);
        });
    });

    describe('Convert Error-Alert Test', () => {
        it('should convert a Alert in a LogFormat object', () => {
            expect(appService.convertAlertToLogMessages(data)[2]).toMatchObject(log2);
        });
    });

    describe('Convert CbOpen-Alert Test', () => {
        it('should convert a Alert in a LogFormat object', () => {
            expect(appService.convertAlertToLogMessages(data)[3]).toMatchObject(log3);
        });
    });

});
