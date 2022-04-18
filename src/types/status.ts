export interface IStatusData {
	memory: NodeJS.MemoryUsage;
	criticalLogs: {
		logs: string[];
		length: number;
	};
}
