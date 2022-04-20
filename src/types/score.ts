import { ICountryItemData } from "./country";
import { IUserCountryItemData, IUserItemData } from "./user";

export interface IScorePOSTData {
	userId: number;
	score: number;
	pp: number;
}

export interface IScoreDELETEData {
	scoreId: number;
}

export interface IScoreBaseData {
	score: bigint | number | string; // since bigint in stored form is usually string
	pp: number;
}

export interface IScoreCountryData extends IScoreBaseData {
	user: IUserCountryItemData;
}

export interface IScoreData extends IScoreBaseData {
	user: IUserItemData;
}

export interface IScoreCountryItemData extends IScoreCountryData {
  scoreId: number;
}

export interface IScoreItemData extends IScoreData {
	scoreId: number;
}

export interface IScoreResponse {
	score: IScoreCountryItemData;
}

export interface IScoresResponse {
	scores: IScoreCountryItemData[];
	length: number;
}

export interface ICountryScoresResponse {
	country: ICountryItemData;
	scores: IScoreItemData[];
	length: number;
}
