// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {contextBridge, ipcRenderer} from 'electron'
import {marked} from "marked";
// this is temporary i know it's not good practice
contextBridge.exposeInMainWorld('ipcRenderer', {
    invoke: async (channel, data) => {
        return await ipcRenderer.invoke(channel, data)
    },
    send: (channel, data) => {
        ipcRenderer.send(channel, data)
    },
    receive: (channel, func) => ipcRenderer.on(
        channel,
        (event, ...args) => {
            return func(event, args[0])
        }
    )
})

contextBridge.exposeInMainWorld('process', {
    platform: process.platform,
    arch: process.arch,
    versions: {
        electron: process.versions.electron,
        node: process.versions.node,
        chrome: process.versions.chrome
    }
})

contextBridge.exposeInMainWorld('os', {
    version: async () => await ipcRenderer.invoke('os-version')
})

contextBridge.exposeInMainWorld('marked', {
    parse: async path => {
        return await ipcRenderer.invoke('parse-markdown', path)
    }
})

contextBridge.exposeInMainWorld('ftStore', {
    getItem: key => ipcRenderer.invoke('getKey', key),
    setKey: (key, value, category) => ipcRenderer.send('setKey', [key, value, category]),
    deleteKey: key => ipcRenderer.send('deleteKey', key),
    keyExists: key => ipcRenderer.invoke('keyExists', key),
    keys: ipcRenderer.invoke('keys'),
    getCategory: category => ipcRenderer.invoke('getCategory', category)
})

contextBridge.exposeInMainWorld('contextmenu', {
    popup: options => ipcRenderer.send('createPopup', options)
})