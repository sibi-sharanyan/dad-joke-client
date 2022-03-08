export interface IClient {
  id: string;
  name: string;
}

export interface IJoke {
  joke: string;
  fromClientId: string;
}

export interface IAddToStreamReq {
  jokeStreamId: string;
  clientId: string;
}
