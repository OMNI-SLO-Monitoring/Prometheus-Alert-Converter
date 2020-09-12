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
     * Takes Alert in correct JSON Format and converts into LogMessage Array. 
     * 
     * To create a Issue of a Alert the LogType must be stated in the Alertname of a rule in rules.yml.
     * Also in the description of a Rule needs to be a JSON String with the key "descriptionName" and optional "VALUE" if a value shall be received. 
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

                const date = new Date(alert.startsAt);
                let log: LogMessageFormat;

                //check for correct LogType
                switch (this.getLogType(alert.labels.alertname)) {
                    case LogType.CPU:
                        log = {
                            type: LogType.CPU,
                            time: date.getTime(),
                            sourceUrl: this.windowsExporterUrl,
                            detectorUrl: this.prometheusUrl,
                            message: this.getDescriptionMessage(alert.annotations.description),
                            data: {
                                cpuUtilization: this.getCPULoadOfString(alert.annotations.description),
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
                                timeoutDuration: 0 //Can be specified when a timeout rule exists.
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
                if(log != null){
                messages.push(log);
                }    

            }
        }
        return messages;
    }

    /**
     * Searches a String for the occurrence of a LogType.
     * 
     * @param alertLabelsAlertname the String containing the LogType.
     * @returns the LogType or null if none was found.
     */
    private getLogType(alertLabelsAlertname: string): LogType {

        if (alertLabelsAlertname.toLowerCase().search('cpu') >= 0) {
            return LogType.CPU
        } else if (alertLabelsAlertname.toLowerCase().search('timeout') >= 0) {
            return LogType.TIMEOUT
        } else if (alertLabelsAlertname.toLowerCase().search('error') >= 0) {
            return LogType.ERROR
        } else if (alertLabelsAlertname.toLowerCase().search('cbopen') >= 0) {
            return LogType.CB_OPEN
        } else {
            return null;
        }
    }

    /**
     * Gets a JSON string and returns the number of the field 'VALUE'. 
     * 
     * @param jsonStringWithData the JSON String containing the CpuLoad. Needs to contain:
     * key 'VALUE' to correctly get the CPU load.
     * @returns the value or zero if none was found.
     */
    private getCPULoadOfString(jsonStringWithData: string): number {
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
     * 
     * @param jsonStringWithMessage the JSON String containing the AlertMessage. Needs to contain:
     * key 'descriptionMessage' to correctly get the CPU load.
     */
    private getDescriptionMessage(jsonStringWithMessage: string): string {
        var data;
        try {
            data = JSON.parse(jsonStringWithMessage);

        } catch (error) {
            return "No description found";
        }

        if (data.descriptionMessage) {
            return data.descriptionMessage;
        } else {
            return "No description found";
        }

    }

}