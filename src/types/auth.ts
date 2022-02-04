export interface IClientPOSTData {
	clientId: string;
	clientKey: string;
}

export interface IAuthenticationResponse {
	accessToken: string;
	expiresIn: string;
}
