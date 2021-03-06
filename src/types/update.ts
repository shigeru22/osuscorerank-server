export interface IUpdatePOSTData {
  apiVersion: string;
  webVersion: string;
}

export interface IUpdateData {
  date: Date;
  apiVersion: string;
  webVersion: string;
  online: boolean;
}

export interface IUpdateOnlinePOSTData {
  updateId: number;
  online: boolean;
}

export interface IUpdateItemData extends IUpdateData {
  updateId: number;
}

export interface IUpdateResponse {
  updateData: IUpdateData;
}

export interface IUpdatesResponse {
  updatesData: IUpdateData[];
  length: number;
}
