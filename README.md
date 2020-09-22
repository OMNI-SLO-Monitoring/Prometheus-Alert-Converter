
<p align="center">
  <img src="https://raw.githubusercontent.com/ccims/overview-and-documentation/c97db39633418d2a0d4e5690a810d62fe5ff5247/app_logos/logo_final_6.25p.svg">
</p>

## Description

The Service receives Alerts from the Prometheus Alertmanager and converts them into logs of the [LogMessageFormat](https://github.com/ccims/logging-message-format).
These logs are then appended into the Kafka Queue, included in the Error-Response Monitor, for retrieval. 
This Service requires the Kafka Queue of the Error-Response Monitor to fully function. The Prometheus Client, Alertmanager and the Windows-Exporter were used to create alerts in the given Prometheus alert format and further restrictions are made to this format. See section 'Installation' for further details.

Port : `http://localhost:3900`

## Installation
### Installing the local Repository:

```bash
$ npm install
```
### Install Prometheus, Alertmanager and Windows-Exporter:

Download Prometheus and Alertmanager from https://prometheus.io/download/

and Windows-Exporter from: https://github.com/prometheus-community/windows_exporter/releases

then replace the prometheus.yml and alert-manager.yml (inside the folders where you installed the Prometheus Client and Alertmanager respectively) with the ones of [this Repository](https://github.com/ccims/Prometheus-Alert-Converter/tree/dev/prometheus) and add the rule.yml to your prometheus folder.

Alternatively, the [Node-Exporter](https://github.com/prometheus/node_exporter) can be used to get system metrics from Linux devices. Note that our given `rules.yml` will **not** work with the Node-Exporter. You would have to define your own alert rules in that case. 

### Set Up Kafka Queue 

See [Error-Response Monitor Documentation](https://github.com/ccims/error-response-monitoring-service/blob/dev/payment-service-monitor/README.md)


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## How to use

### Requests

These Requests are useable: 

[GET]

At `http://localhost:3900/get-sample` you receive an Array of example LogMessages converted from sample-alert.json.

At `http://localhost:3900/send-sample` you receive a resolved Message if the Alerts from sample-alert.json are converted correctly and send to the Queue.

[POST]

At `http://localhost:3900/post-alerts` you can post an Alert in the format given by the [Alertmanager-Webhookformat](https://prometheus.io/docs/alerting/latest/configuration/#webhook_config) , it will be converted into a LogMessage and send to the Kafka Queue.

### Alert Rules

The Prometheus Alert Rules (`rules.yml`) file has a "description" key. In here the Alert-Converter requires you to have a JSON-String in the following format. 

``` json
{
  "descitpionMessage": "yourMessage",
  "LogType": "cpu",
  "VALUE": {{$value}}
}
```
The `LogType` key is required while `desriptionMessage` and `VALUE` are optional keys.
The key `LogType` of the JSON-String is necessary to create a LogMessage of fitting [LogType](https://github.com/ccims/logging-message-format/blob/dev/src/log-type.ts). The values of `LogType` can be `cpu`, `error`, `timeout` or `cbopen`.

Optionally a Message can be declared in the key `descriptionMessage` and if the Rule uses values from windows-exporter use <br>
`\"VALUE\" : {{$value}}` to retrieve the value. 

This JSON object has to be converted into a String and placed into the `description` field of the `rules.yml` file.

Example Rule:
```
#Alert for CPU load being over 80% for 3 minutes
  - alert: HostHighCpuLoad
    expr: 100 - (avg by (instance) (irate(windows_cpu_time_total{mode="idle"}[1m])) * 100) > 80
    for: 3m
    labels:
      severity: warning
    annotations:
      summary: "Host high CPU load (instance {{ $labels.instance }})"
      description: "{ \"descriptionMessage\" : \"CPU load is > 80%\" \n , \"LogType\" : \"cpu\" \n , \"VALUE\" : {{$value}} }"
```
In the last line you can see the JSON-String as a value of the `description` field. 

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


