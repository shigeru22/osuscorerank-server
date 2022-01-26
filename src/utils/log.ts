import _ from "lodash";

export enum LogLevel {
	DEBUG = 0,
	INFO,
	LOG,
	WARN,
	ERROR
}

const LogLevelMessage = [ "DEBUG", "INFO", "LOG", "WARN", "ERROR" ];

export function log(message: string, level?: LogLevel) {
	console.log(`[${ _.isUndefined(level) ? LogLevelMessage[LogLevel.INFO] : LogLevelMessage[level] }] ${ message }`);
}
