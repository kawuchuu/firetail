// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import {contextBridge, ipcRenderer} from 'electron'

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
        (event, ...args) => func(event, args[0])
    )
})

contextBridge.exposeInMainWorld('process', {
    platform: process.platform
})