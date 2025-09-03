export interface LastFMToken {
  token: string;
}

export interface LastFMSession {
  session: {
    name: string;
    key: string;
    subscriber: number;
  }
}