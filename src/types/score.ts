import { IUserItemData } from "./user";

export interface IScorePOSTData {
	userId: number;
	score: number;
	pp: number;
}

export interface IScoreDELETEData {
	scoreId: number;
}

export interface IScoreData {
	user: IUserItemData;
	score: bigint | number | string; // since bigint in stored form is usually string
	pp: number;
}

export interface IScoreItemData extends IScoreData {
  scoreId: number;
}

export interface IScoreResponse {
	score: IScoreItemData;
}

export interface IScoresResponse {
	scores: IScoreItemData[];
	length: number;
}
