import { ConfigService } from '@nestjs/config';
import { LogMessageFormat, LogType } from 'logging-format';
/**
 * Class for Converting an Alert into a LogMessage.  * 
 */
export class AlertConverterService {
    prometheusUrl: string;
    windowsExporterUrl: string;
    constructor(private configService: ConfigService) {
    }

    /**
     * Takes Alert in correct JSON Format and converts into a LogMessage Array. 
     * 
     * To create an Issue of an Alert the description of a Rule needs to be a JSON String with the keys "descriptionName" and "LogyType".
     * Optional key "VALUE" if a value shall be received. 
     * 
     * @param alertJSON the Alert in the Format: https://prometheus.io/docs/alerting/latest/configuration/#webhook_config.
     * @returns an Array of LogMessages.
     */
    public alertToLogMessages(alertJSON): LogMessageFormat[] {
        let messages: LogMessageFormat[] = [];

        this.prometheusUrl = this.configService.get<string>("PROMETHEUS_URL", "http://localhost:9090/");
        this.windowsExporterUrl = this.configService.get<string>("WINDOWS_EXPORTER_URL", "http://localhost:9182/metrics");


        //gets all subAlerts of the JSON, each equal one LogMessage.
        for (let i = 0; i < alertJSON.alerts.length; i++) {
            let alert = alertJSON.alerts[i];
            let alertStatus = alert.status;

            //tests if sub-alert is still relevant, then creates a LogMessage
            if (alertStatus == "firing") {

                const date = new Date(alert.startsAt);// Prometheus uses UTC Time. 
                let log: LogMessageFormat;

                //check for correct LogType
                switch (this.getLogType(alert.annotations.description)) {
                    case LogType.CPU:
                        log = {
                            type: LogType.CPU,
                            time: date.getTime(),
                            sourceUrl: this.windowsExporterUrl,
                            detectorUrl: this.prometheusUrl,
                            message: this.getDescriptionMessage(alert.annotations.description),
                            data: {
                                cpuUtilization: this.getValueOfString(alert.annotations.description),
                            },
                        };
                        break;

                    case LogType.TIMEOUT:
                        log = {
                            type: LogType.TIMEOUT,
                            time: date.getTime(),
                            sourceUrl: this.windowsExporterUrl,
                            detectorUrl: this.prometheusUrl,
                            message: this.getDescriptionMessage(alert.annotations.description),
                            data: {
                                timeoutDuration: this.getValueOfString(alert.annotations.description), //Can be specified when a timeout rule exists.
                            },
                        };
                        break;

                    case LogType.ERROR:
                        log = {
                            type: LogType.ERROR,
                            time: date.getTime(),
                            sourceUrl: this.windowsExporterUrl,
                            detectorUrl: this.prometheusUrl,
                            message: this.getDescriptionMessage(alert.annotations.description),
                            data: null,//Can be specified when a timeout rule exists.
                        };
                        break;

                    case LogType.CB_OPEN:
                        log = {
                            type: LogType.CB_OPEN,
                            time: date.getTime(),
                            sourceUrl: this.windowsExporterUrl,
                            detectorUrl: this.prometheusUrl,
                            message: this.getDescriptionMessage(alert.annotations.description),
                            data: null, //Can be specified when an timeout rule exists.
                        };
                        break;

                    default:
                        console.log("Found Alert without fitting LogType");
                        log = null;
                }
                //only return logs of correct LogType.
                if (log != null) {
                    messages.push(log);
                }
            }
        }
        return messages;
    }

    /**
     * Gets a JSON string and returns the value of the key 'LogType'.
     * 
     * @param jsonStringWithLogType the JSON String containing the key 'LogType'.
     * @returns the LogType or null if none was found.
     */
    private getLogType(jsonStringWithLogType: string): LogType {
        var data
        try {
            data = JSON.parse(jsonStringWithLogType)
        } catch (error) {
            console.log("Error while retrieving LogType");
            return null;
        }

        if (data.LogType.toLowerCase() == 'cpu') {
            return LogType.CPU
        } else if (data.LogType.toLowerCase() == 'timeout') {
            return LogType.TIMEOUT
        } else if (data.LogType.toLowerCase() == 'error') {
            return LogType.ERROR
        } else if (data.LogType.toLowerCase() == 'cbopen') {
            return LogType.CB_OPEN
        } else {
            return null;
        }
    }

    /**
     * Gets a JSON string and returns the value of the key 'VALUE'. 
     * 
     * @param jsonStringWithData the JSON String containing the data to return. Needs to contain:
     * key 'VALUE' to correctly get the data.
     * @returns the value or zero if none was found.
     */
    private getValueOfString(jsonStringWithData: string): number {
        var data;
        try {
            data = JSON.parse(jsonStringWithData);
        } catch (error) {
            return 0;
        }

        if (data.VALUE) {
            return data.VALUE;
        } else {
            return 0;
        }
    }

    /**
     * Gets a JSON string and returns the value of the key 'descriptionMessage'. 
     * 
     * 
     * @param jsonStringWithMessage the JSON String containing the AlertMessage. Needs to contain:
     * key 'descriptionMessage' to correctly get the CPU load.
     * @returns the Message as String or the String "No Message found" if the message is not retrievable.
     */
    private getDescriptionMessage(jsonStringWithMessage: string): string {
        var data;
        try {
            data = JSON.parse(jsonStringWithMessage);
        } catch (error) {
            return "No Message found";
        }

        if (data.descriptionMessage) {
            return data.descriptionMessage;
        } else {
            return "No Message found";
        }
    }
}