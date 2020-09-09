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
     * If the LogType should be included, the description of a rule in rules.yml needs to contain the LogType.
     * If Values shall be retrievable the rule needs to contain the field 'VALUE' in the description. 
     * 
     * TODO: needs error handling 
     * 
     * @param alertJSON the Alert in the Format: https://prometheus.io/docs/alerting/latest/configuration/#webhook_config.
     * @returns an Array of LogMessages.
     */
    public alertToLogMessages(alertJSON): LogMessageFormat[] {
        let messages: LogMessageFormat[] = [];

        this.prometheusUrl = this.configService.get<string>("PROMETHEUS_URL", "http://localhost:9090/");
        this.windowsExporterUrl = this.configService.get<string>("WINDOWS_EXPORTER_URL", "http://localhost:9182/metrics");

        console.log(JSON.stringify(alertJSON));

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
                            message: alert.annotations.description,
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
                            message: alert.annotations.description,
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
                            message: alert.annotations.description,
                            data: null,//Can be specified when a timeout rule exists.
                        };
                        break;

                    case LogType.CB_OPEN:
                        log = {
                            type: LogType.CB_OPEN,
                            time: date.getTime(),
                            sourceUrl: this.windowsExporterUrl,
                            detectorUrl: this.prometheusUrl,
                            message: alert.annotations.description,
                            data: null, //Can be specified when an timeout rule exists.
                        };
                        break;

                    default:
                        log = {
                            type: null,
                            time: date.getTime(),
                            sourceUrl: this.windowsExporterUrl,
                            detectorUrl: this.prometheusUrl,
                            message: alert.annotations.description,
                            data: null,
                        };
                }
                messages.push(log);
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
     * Searches a String for CpuLoad data. 
     * 
     * @param stringContainingData the String containing the CpuLoad. Needs to contain:
     * '... VALUE = ....' to correctly get the CPU load.
     * @returns the value or zero if none was found.
     */
    private getCPULoadOfString(stringContainingData: string): number {

        if (stringContainingData.search('VALUE') >= 0) {
            
            let start = stringContainingData.search('VALUE') + 8;//returns where the Value starts in the string
            let end = start + 7;//returns where the Value ends in the string
            return parseInt(stringContainingData.substring(start, end));
        } else {
            return 0;
        }
    }

}