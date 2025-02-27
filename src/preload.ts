import {contextBridge, ipcRenderer, webUtils} from 'electron';

contextBridge.exposeInMainWorld('library', {
  getAllSongs: () => ipcRenderer.sendSync('getAllSongs'),
  getAllAlbums: () =>  ipcRenderer.sendSync('getAllAlbums'),
  getAllFromMatchingColumns: (column: string, value: string) => ipcRenderer.sendSync('getAllFromMatchingColumns', [column, value]),
  getAllFromAlbum: (album: string, albumArtist: string) => ipcRenderer.sendSync('getAllFromAlbum', [album, albumArtist]),
  addToLibrary: (locations:string[]) => ipcRenderer.send('addToLibrary', locations),
  onRefreshView: (callback) => ipcRenderer.on('refreshView', (_event, value) => callback(value))
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
  getCategory: (category: string) => ipcRenderer.invoke('getCategory', category)
});

contextBridge.exposeInMainWorld('ftStoreSync', {
  getItem: (key: string) => ipcRenderer.sendSync('getKeySync', key),
  keyExists: (key: string) => ipcRenderer.sendSync('keyExistsSync', key),
  getCategory: (category: string) => ipcRenderer.sendSync('getCategorySync', category),
});

contextBridge.exposeInMainWorld('misc', {
  openLink: (link: string) => ipcRenderer.invoke('openLink', link),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
});

contextBridge.exposeInMainWorld('setupApp', {
  generalInfo: async () => ipcRenderer.invoke('getGeneralInfo')
});