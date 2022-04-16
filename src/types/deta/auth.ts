import { IClientData } from "../auth";

export interface IClientDetailData extends IClientData {
	key: string; // key is client's ID
	dateAdded: Date | string;
}
