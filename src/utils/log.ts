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
	if(!_.isUndefined(process.env.DEVELOPMENT) &&	_.parseInt(process.env.DEVELOPMENT, 10) === 0 &&	level === LogLevel.DEBUG) {
		return;
	}

	console.log(`[${ _.isUndefined(level) ? LogLevelMessage[LogLevel.INFO] : LogLevelMessage[level] }] ${ message }`);
}
