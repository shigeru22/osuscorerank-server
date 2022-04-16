export interface IScorePOSTData {
	userId: number;
	score: number;
	pp: number;
}

export interface IScoreDELETEData {
	scoreId: number;
}

export interface IScoreData {
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
	score: bigint | number | string; // since bigint in stored form is usually string
	pp: number;
}

export interface IScoreItemData extends IScoreData {
  scoreId: number;
}

export interface IScoreKeyData {
  key: number;
  item: IScoreData;
}

export interface IScoreDetailData extends IScoreData {
	key: string;
	dateAdded: Date | string;
}

export interface IScoreResponse {
	score: IScoreItemData;
}

export interface IScoresResponse {
	scores: IScoreItemData[];
	length: number;
}
