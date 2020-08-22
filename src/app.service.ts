import { Injectable } from '@nestjs/common';
import { LogMessageFormat } from "logging-format";
const {Kafka} = require('kafkajs');

const kafka = new Kafka({
  clientId: 'prometheus-alert-converter',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();

@Injectable()
export class AppService {

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
value: JSON.stringify(logMessage)}]
    });
    await producer.disconnect();
  }
}
