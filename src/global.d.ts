import FiretailSong from "./types/FiretailSong";
import {Albums} from "./types/Albums";

interface LibraryPreload {
  getAllSongs: () => FiretailSong[];
  getAllAlbums: () => Albums[];
  getAllFromMatchingColumns: (column: string, value: string) => FiretailSong[];
  getAllFromAlbum: (album: string, albumArtist: string) => FiretailSong[];
  addToLibrary: (locations: string[]) => void;
  onRefreshView: (callback: any) => Electron.IpcRenderer;
}

interface PlayerPreload {
  next: (callback: any) => Electron.IpcRenderer;
  previous: (callback: any) => Electron.IpcRenderer;
  pause: (callback: any) => Electron.IpcRenderer;
  playPause: (callback: any) => Electron.IpcRenderer;
  stop: (callback: any) => Electron.IpcRenderer;
  play: (callback: any) => Electron.IpcRenderer;
  seek: (callback: any) => Electron.IpcRenderer;
  setPosition: (callback: any) => Electron.IpcRenderer;
  updateMetadata: (song: FiretailSong) => void;
}

interface PathPreload {
  getImages: () => Promise<string>;
  getImagesSync: () => string;
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

declare global {
  interface Window {
    library: LibraryPreload;
    player: PlayerPreload;
    path: PathPreload;
    processPreload: ProcessPreload;
    ftStore: FTStorePreload;
    ftStoreSync: FTStoreSyncPreload;
    misc: MiscPreload;
    setupApp: SetupAppPreload;
    safeStorage: SafeStoragePreload;
  }
}