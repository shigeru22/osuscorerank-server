import { ICountryData } from "../country";

export interface ICountryItemDetailData extends ICountryData {
	key: string;
	dateAdded: Date | string;
}
