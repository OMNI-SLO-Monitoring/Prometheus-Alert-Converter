import { Injectable } from '@nestjs/common';
import { LogMessageFormat } from "logging-format";
import { AlertConverterService } from './alert-converter/alert-converter.service';
const { Kafka } = require('kafkajs');

//This services sends the LogMessages to the Queue and the issue-creator consumes them.
const kafka = new Kafka({
  clientId: 'prometheus-alert-converter',
  brokers: ['localhost:9092']
});
const producer = kafka.producer();


/**
 * Services to convert an Alert into LogMessages and send them to the Kafka Queue.
 */
@Injectable()
export class AppService {

  constructor(
    private alertConverter: AlertConverterService,
  ) { }

  /**
   * Takes Alert in correct JSON Format and converts into LogMessage Array.
   * 
   * @param alert the Alert in the Format: https://prometheus.io/docs/alerting/latest/configuration/#webhook_config
   * @returns The converted LogMessages as Array.
   */
  convertAlertToLogMessages(alert): LogMessageFormat[] {
    return this.alertConverter.alertToLogMessages(alert);
  }

  /**
   * Sends the log message to the kafka topic 'logs'.
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

  /**
   * Converts the Alerts into LogMessages and sends them into the Queue.
   * 
   * @param alert the alert to convert and send into the queue.
   * @returns A resolved Promise. 
   */
  async sendConvertedLogs(alert): Promise<any> {
    let messages: LogMessageFormat[] = this.convertAlertToLogMessages(alert);

    messages.forEach(element => {
      //TODO: needs error handling 
      console.log("Send to Queue: " + element);
      this.sendLogMessage(element);
    });

    return new Promise((res, rej) => {
      res("Conversion complete, send LogMessages to Queue");
    });
  }
}
