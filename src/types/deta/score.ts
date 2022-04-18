import { IScoreData } from "../score";

export interface IScoreDetailData extends IScoreData {
	key: string;
	countryId: number;
	userId: number;
	updateId: number;
	dateAdded: Date | string;
}
