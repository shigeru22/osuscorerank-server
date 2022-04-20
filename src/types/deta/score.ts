import { IScoreCountryItemData } from "../score";

export interface IScoreDetailData extends IScoreCountryItemData {
	key: string;
	countryId: number;
	userId: number;
	updateId: number;
	isActive: boolean;
	dateAdded: Date | string;
}
