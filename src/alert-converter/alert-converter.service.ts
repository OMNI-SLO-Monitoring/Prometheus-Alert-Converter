import { LogMessageFormat, LogType } from 'logging-format';
/**
 * Class for Converting an Alert into a LogMessage. 
 * TODO: Make things more generic
 */
export class AlertConverterService {

    /**
     * Takes Alert in correct JSON Format and converts into LogMessage Array.
     * 
     * TODO: needs error handling 
     * @param alertJSON the Alert in the Format: https://prometheus.io/docs/alerting/latest/configuration/#webhook_config.
     * @returns an  Array of LogMessages.
     */
    public alertToLogMessages(alertJSON): LogMessageFormat[] {
        let messages: LogMessageFormat[] = [];

        //gets all subAlerts of the JSON, each equal one LogMessage.
        for (let i = 0; i < alertJSON.alerts.length; i++) {
            let alert = alertJSON.alerts[i];
            let alertStatus = alert.status;

            //tests if sub-alert is still relevant, then creates a LogMessage
            if (alertStatus == "firing") {

                const date = new Date(alert.startsAt);
                const log: LogMessageFormat = {
                    type: LogType.CPU,
                    time: date.getTime(),
                    source: null, //TODO: Define source
                    detector: 'Prometheus',
                    message: alert.annotations.description,
                    data: {
                        cpuUtilization: 0,
                    },
                };
                messages.push(log);
            }
        }
        return messages;
    }
}