import { IUserStatistics } from "../osu/osu-structures";

export interface IUserStatsFile {
	[key: string]: IUserStatistics[];
}
