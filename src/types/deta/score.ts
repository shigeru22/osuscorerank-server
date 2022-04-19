import { IScoreData } from "../score";

export interface IScoreDetailData extends IScoreData {
	key: string;
	countryId: number;
	userId: number;
	updateId: number;
	isActive: boolean;
	dateAdded: Date | string;
}
