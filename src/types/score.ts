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
			osuId: number;
		};
	};
}

export interface IScoreDeltaResponseData extends IScoreResponseData {
	delta: number;
}

export interface IGlobalScoreDeltaResponseData extends IGlobalScoreResponseData {
	delta: number;
}
