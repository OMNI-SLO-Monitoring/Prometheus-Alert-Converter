import { Injectable } from '@nestjs/common';
import { LogMessageFormat } from "logging-format";
import { AlertConverterService } from './alert-converter/alert-converter.service';
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'prometheus-alert-converter',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

@Injectable()
export class AppService {

  constructor(
    private alertConverter: AlertConverterService,
  ) { }

  /**
   * Takes Alert in correct JSON Format and converts into LogMessage Array.
   * @param alert the Alert in the Format: https://prometheus.io/docs/alerting/latest/configuration/#webhook_config
   */
  convertAlertToLogMessages(alert): LogMessageFormat[] {  

    return this.alertConverter.alertToLogMessages(alert); ;

  }

  /**
   * Sends the log message to the kafka topic logs
   * 
   * @param logMessage log in the LogMessageFormat to be send to the issue creator
   */
  async sendLogMessage(logMessage: LogMessageFormat) {
    await producer.connect();
    await producer.send({
      topic: 'logs',
      messages: [{
        value: JSON.stringify(logMessage)
      }]
    });
    await producer.disconnect();
  }
}
