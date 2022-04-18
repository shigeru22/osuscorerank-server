export enum LogSeverity {
	DEBUG = 0,
	LOG,
	WARN,
	ERROR
}

const severityString = [ "DEBUG", "LOG", "WARN", "ERROR" ];

export const criticalLogs: string[] = [];

export function log(message: string, source: string, severity: LogSeverity = LogSeverity.LOG) {
	if(typeof(process.env.DEVELOPMENT) === "undefined" || process.env.DEVELOPMENT !== "1") {
		if(severity === LogSeverity.DEBUG) {
			return;
		}
	}

	const logText = `[${ severityString[severity] }] ${ source } :: ${ message }`;

	if(severity >= LogSeverity.WARN) {
		if(criticalLogs.length === 10) {
			criticalLogs.shift();
		}
		criticalLogs.push(logText);
	}

	console.log(logText);
}
