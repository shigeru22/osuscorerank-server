export enum LogSeverity {
	DEBUG = 0,
	LOG,
	WARN,
	ERROR
}

const severityString = [ "DEBUG", "LOG", "WARN", "ERROR" ];

export function log(message: string, source: string, severity: LogSeverity = LogSeverity.LOG) {
	if(typeof(process.env.DEVELOPMENT) === "undefined" || process.env.DEVELOPMENT !== "1") {
		if(severity === LogSeverity.DEBUG) {
			return;
		}
	}

	console.log(`[${ severityString[severity] }] ${ source } :: ${ message }`);
}
