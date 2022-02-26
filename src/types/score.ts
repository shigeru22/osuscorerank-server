import { IUserScore } from "./prisma/score";

export interface IScorePOSTData {
	userId: number;
	score: number;
	pp: number;
	globalRank: number;
}

export interface IScoreDELETEData {
	scoreId: number;
}

export interface IScoreResponseData {
	scoreId: number;
	user: {
		userId: number;
		userName: string;
		osuId: number;
	};
	score: bigint | number;
	pp: number;
	globalRank: number;
}

export interface IGlobalScoreResponseData extends IScoreResponseData {
	user: {
		userId: number;
		userName: string;
		osuId: number;
		country: {
			countryId: number;
			countryName: string;
			countryCode: string;
		};
	};
}

export interface IScoreDeltaResponseData extends IScoreResponseData {
	delta: number;
}

export interface IGlobalScoreDeltaResponseData extends IGlobalScoreResponseData {
	delta: number;
}

export interface IRankingResponse {
	inactives: {
		recentlyInactive: number;
	};
	total: number;
}

export interface IGlobalRankingResponse extends IRankingResponse {
	rankings: IGlobalScoreDeltaResponseData[];
}

export interface ICountryRankingResponse extends IRankingResponse {
	country: {
		countryId: number;
		countryName: string;
		countryCode: string;
	};
	rankings: IScoreDeltaResponseData[];
}

export interface IUserScoreResponse {
	score: IUserScore;
}

export interface IUserScoresResponse {
	scores: IUserScore[];
}
