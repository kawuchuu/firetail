import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('library', {
  getAllSongs: async () => await ipcRenderer.invoke('getAllSongs')
});