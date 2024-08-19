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