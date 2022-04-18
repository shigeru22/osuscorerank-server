import { IScoreData } from "../score";

export interface IScoreDetailData extends IScoreData {
	key: string;
	updateId: number;
	dateAdded: Date | string;
}
