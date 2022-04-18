export interface IClientPOSTData {
	clientId: string;
	clientKey: string;
}

export interface IClientData {
	clientId: string;
	clientName: string;
	clientKey: string;
}

export interface IAuthenticationResponse {
	accessToken: string;
	expiresIn: string;
}
