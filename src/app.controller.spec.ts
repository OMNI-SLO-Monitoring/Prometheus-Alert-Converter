import { Test, TestingModule } from '@nestjs/testing';
import { AlertConverterService } from './alert-converter/alert-converter.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [AlertConverterService],
      controllers: [AppController],
      providers: [AppService, AlertConverterService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined"', () => {
      expect(appController).toBeDefined;
    });
  });
});
