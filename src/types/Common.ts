import FiretailSong from "./FiretailSong";

export class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}


export interface SongsGenre {
  songs: FiretailSong[],
  genres: string[],
  artists?: string[],
  sum: number
}

export enum RepeatMode {
  NO_REPEAT,
  REPEAT_ALL,
  REPEAT_ONE
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlaylistSong {
  playlistId: number;
  songId: string;
  position: number;
}