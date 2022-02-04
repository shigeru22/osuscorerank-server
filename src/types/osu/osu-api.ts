import { IBeatmapset, ISpotlight, IUserStatistics } from "./osu-structures";

export interface IClientCredentialsPOSTRequest {
  client_id: number;
  client_secret: string;
  grant_type: "client_credentials";
  scope: "public";
}

export interface IClientCredentialsPOSTResponse {
  token_type: string;
  expires_in: number;
  access_token: string;
}

export interface IRankingsGETResponse<T> {
  beatmapsets: IBeatmapset[] | null;
  cursor: T | null;
  ranking: IUserStatistics[];
  spotlight: ISpotlight | null;
  total: number;
}
