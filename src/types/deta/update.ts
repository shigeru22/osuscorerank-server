import { IUpdateData } from "../update";

export interface IUpdateDetailData extends IUpdateData {
	key: string;
	dateAdded: Date | string;
}
