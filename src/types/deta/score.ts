import { IScoreData } from "../score";

export interface IScoreDetailData extends IScoreData {
	key: string;
	dateAdded: Date | string;
}
