import {contextBridge, ipcRenderer, webUtils} from 'electron';
import FiretailSong from "./types/FiretailSong";

contextBridge.exposeInMainWorld('library', {
  getAllSongs: () => ipcRenderer.sendSync('getAllSongs'),
  getAllAlbums: () =>  ipcRenderer.sendSync('getAllAlbums'),
  getAllFromMatchingColumns: (column: string, value: string) => ipcRenderer.sendSync('getAllFromMatchingColumns', [column, value]),
  getAllFromAlbum: (album: string, albumArtist: string) => ipcRenderer.sendSync('getAllFromAlbum', [album, albumArtist]),
  addToLibrary: (locations:string[]) => ipcRenderer.send('addToLibrary', locations),
  onRefreshView: (callback) => ipcRenderer.on('refreshView', (_event, value) => callback(value))
});

contextBridge.exposeInMainWorld('player', {
  next: (callback) => ipcRenderer.on('playerNext', () => callback()),
  previous: (callback) => ipcRenderer.on('playerPrevious', () => callback()),
  pause: (callback) => ipcRenderer.on('playerPause', () => callback()),
  playPause: (callback) => ipcRenderer.on('playerPlayPause', () => callback()),
  stop: (callback) => ipcRenderer.on('playerStop', () => callback()),
  play: (callback) => ipcRenderer.on('playerPlay', () => callback()),
  seek: (callback) => ipcRenderer.on('playerSeek', (_event, Offset: bigint) => callback(Offset)),
  setPosition: (callback) => ipcRenderer.on('playerSetPosition', (_event, TrackId: string, Position: bigint) => callback(TrackId, Position)),
  updateMetadata: (song: FiretailSong) => ipcRenderer.send('updateMetadata', song),
  onPause: () => ipcRenderer.send('onPause'),
  onPlay: () => ipcRenderer.send('onPlay'),
  updatePosition: (position: number, emit: boolean) => ipcRenderer.send('updatePosition', position, emit),
});

contextBridge.exposeInMainWorld('path', {
  getImages: async () => await ipcRenderer.invoke('getImagePath'),
  getImagesSync: () => ipcRenderer.sendSync('getImagePathSync')
});

contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
  arch: process.arch,
});

contextBridge.exposeInMainWorld('ftStore', {
  getItem: (key: string) => ipcRenderer.invoke('getKey', key),
  setKey: (key: string, value: any, category: string) => ipcRenderer.send('setKey', [key, value, category]),
  deleteKey: (key: string) => ipcRenderer.send('deleteKey', key),
  keyExists: (key: string) => ipcRenderer.invoke('keyExists', key),
  keys: ipcRenderer.invoke('keys'),
  getCategory: (category: string) => ipcRenderer.invoke('getCategory', category),
  secureSetKey: (key: string, value: string, category: string) => ipcRenderer.send('secureSetKey', [key, value, category]),
  secureGetItem: (key: string) => ipcRenderer.invoke('secureGetKey', key),
});

contextBridge.exposeInMainWorld('ftStoreSync', {
  getItem: (key: string) => ipcRenderer.sendSync('getKeySync', key),
  keyExists: (key: string) => ipcRenderer.sendSync('keyExistsSync', key),
  getCategory: (category: string) => ipcRenderer.sendSync('getCategorySync', category),
});

contextBridge.exposeInMainWorld('misc', {
  openBrowser: (url: string) => ipcRenderer.send('openBrowser', url),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
});

contextBridge.exposeInMainWorld('setupApp', {
  generalInfo: async () => ipcRenderer.invoke('getGeneralInfo')
});

contextBridge.exposeInMainWorld('safeStorage', {
  encryptString: (text: string) => ipcRenderer.invoke('encryptString', text),
  decryptString: (text: Buffer) => ipcRenderer.invoke('decryptString', text),
});