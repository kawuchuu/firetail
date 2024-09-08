import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('library', {
  getAllSongs: async () => await ipcRenderer.invoke('getAllSongs'),
  getAllAlbums: async () => await ipcRenderer.invoke('getAllAlbums'),
  getAllFromMatchingColumns: async (column: string, value: string) => await ipcRenderer.invoke('getAllFromMatchingColumns', [column, value]),
  getAllFromAlbum: async (album: string, albumArtist: string) => await ipcRenderer.invoke('getAllFromAlbum', [album, albumArtist]),
});

contextBridge.exposeInMainWorld('path', {
  getImages: async () => await ipcRenderer.invoke('getImagePath'),
  getImagesSync: () => ipcRenderer.sendSync('getImagePathSync')
});

contextBridge.exposeInMainWorld('process', {
  platform: process.platform,

});

contextBridge.exposeInMainWorld('ftStore', {
  getItem: (key: string) => ipcRenderer.invoke('getKey', key),
  setKey: (key: string, value: any, category: string) => ipcRenderer.send('setKey', [key, value, category]),
  deleteKey: (key: string) => ipcRenderer.send('deleteKey', key),
  keyExists: (key: string) => ipcRenderer.invoke('keyExists', key),
  keys: ipcRenderer.invoke('keys'),
  getCategory: (category: string) => ipcRenderer.invoke('getCategory', category)
});

contextBridge.exposeInMainWorld('misc', {
  openLink: (link: string) => ipcRenderer.invoke('openLink', link),
});