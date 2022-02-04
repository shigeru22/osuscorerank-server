export interface IResponseMessage {
	message: string;
}

export interface IResponseData<T> extends IResponseMessage {
	data: T;
}
