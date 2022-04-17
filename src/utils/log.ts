import _ from "lodash";

export enum LogSeverity {
	DEBUG = 0,
	LOG,
	WARN,
	ERROR
}

const severityString = [ "DEBUG", "INFO", "LOG", "WARN", "ERROR" ];

export function log(message: string, source: string, severity?: LogSeverity) {
	if(typeof(process.env.DEVELOPMENT) === "undefined" || process.env.DEVELOPMENT !== "1") {
		if(severity === LogSeverity.DEBUG) {
			return;
		}
	}

	console.log(`[${ severityString[_.isUndefined(severity) ? 3 : severity] }] ${ source } :: ${ message }`);
}
