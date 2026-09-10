import FiretailSong from "./types/FiretailSong";
import {Albums} from "./types/Albums";
import {Ref} from "vue";
import {Playlist, RepeatMode} from "./types/Common";

interface LibraryPreload {
  getAllSongs: () => FiretailSong[];
  getAllAlbums: () => Albums[];
  getAllArtists: () => string[];
  getAllFromMatchingColumns: (column: string, value: string) => FiretailSong[];
  getAllFromAlbum: (album: string, albumArtist: string) => FiretailSong[];
  getAllFromArtist: (artist: string) => FiretailSong[];
  getGenres: () => string[];
  getSongsFromGenre: (genre: string) => FiretailSong[];
  addToLibrary: (locations: string[]) => void;
  onRefreshView: (callback: any) => Electron.IpcRenderer;
}

interface PlaylistsPreload {
  getAllPlaylists: () => Playlist[];
  getPlaylist: (playlistId: number) => Playlist;
  getAllSongsFromPlaylist: (playlistId: number) => FiretailSong[];
  getAllActualSongsFromPlaylist: (playlistId: number) => FiretailSong[];
  addToPlaylist: (songs: FiretailSong[], playlistId: number) => void;
}

interface PlayerPreload {
  next: (callback: any) => Electron.IpcRenderer;
  previous: (callback: any) => Electron.IpcRenderer;
  pause: (callback: any) => Electron.IpcRenderer;
  playPause: (callback: any) => Electron.IpcRenderer;
  stop: (callback: any) => Electron.IpcRenderer;
  play: (callback: any) => Electron.IpcRenderer;
  seek: (callback: any) => Electron.IpcRenderer;
  updateShuffled: (callback: any) => Electron.IpcRenderer;
  onShuffleUpdate: (shuffle: boolean) => void;
  updateRepeat: (callback: any) => Electron.IpcRenderer;
  onRepeatUpdate: (mode: RepeatMode) => void;
  setPosition: (callback: any) => Electron.IpcRenderer;
  updateMetadata: (song: FiretailSong) => void;
  onPause: () => void;
  onPlay: () => void;
  updatePosition: (position: number, emit: boolean) => void;
  onVolumeChange: (volume: number) => void;
  updateVolume: (callback: any) => Electron.IpcRenderer;
}

interface PathPreload {
  getImages: () => Promise<string>;
  getImagesSync: () => string;
  join: (...paths: string[]) => Promise<string>;
}

interface ProcessPreload {
  platform: string;
  arch: string;
}

interface FTStorePreload {
  getItem: (key: string) => Promise<any>;
  setKey: (key: string, value: any, category: string) => void;
  deleteKey: (key: string) => void;
  keyExists: (key: string) => Promise<boolean>;
  keys: Promise<string[]>;
  getCategory: (category: string) => Promise<string[]>;
  secureSetKey: (key: string, value: string, category: string) => void;
  secureGetItem: (key: string) => Promise<any>;
}

interface FTStoreSyncPreload {
  getItem: (key: string) => any;
  keyExists: (key: string) => boolean;
  getCategory: (category: string) => string[];
}

interface MiscPreload {
  openBrowser: (url: string) => void;
  getPathForFile: (file: File) => string;
}

// fix this later lol
interface SetupAppPreload {
  generalInfo: () => Promise<any>;
}

interface SafeStoragePreload {
  encryptString: (text: string) => Promise<Buffer>;
  decryptString: (text: Buffer) => Promise<string>;
}

interface PluginsPreload {
  getPluginManifests: () => Promise<Array<{ pluginDir: string; manifest: PluginManifest }>>;
  readPluginFile: (filePath: string) => Promise<string>;
}

declare global {
  interface Window {
    library: LibraryPreload;
    playlists: PlaylistsPreload;
    player: PlayerPreload;
    path: PathPreload;
    processPreload: ProcessPreload;
    ftStore: FTStorePreload;
    ftStoreSync: FTStoreSyncPreload;
    misc: MiscPreload;
    setupApp: SetupAppPreload;
    safeStorage: SafeStoragePreload;
    plugins: PluginsPreload;
  }
}