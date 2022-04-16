export interface IClientPOSTData {
	clientId: string;
	clientKey: string;
}

export interface IClientData {
	clientName: string;
	clientKey: string;
}

export interface IClientKeyData {
	key: number;
	item: IClientData;
}

export interface IClientDetailData extends IClientData {
	key: string; // key is client's ID
	dateAdded: Date | string;
}

export interface IAuthenticationResponse {
	accessToken: string;
	expiresIn: string;
}
