'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import {
    createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {
    VUEJS_DEVTOOLS
} from 'electron-devtools-installer'
import fs from 'fs'
import db from './modules/database'
import files from './modules/files'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
    scheme: 'app',
    privileges: {
        secure: true,
        standard: true
    }
}])

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1100,
        height: 650,
        show: false,
        backgroundColor: '#181818',
        title: 'Firetail Next',
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
        }
    })
    win.setMenuBarVisibility(false)
    ipcMain.on('getlibrary', () => {
        fs.promises.readFile(`${app.getPath('userData')}/library.json`, err => {
            if (err) throw err
        }).then(async file => {
            let library = JSON.parse(file.toString())
            let listStart = Object.entries(library).map(e => [e[0]])
            let genList = new Promise((resolve) => {
                let songIndex = []
                let numCount = 0
                let artistList = []
                let artistsUsed = []
                let albumList = []
                let albumsUsed = []
                listStart.forEach((value) => {
                    value = value[0]
                    let fName = value.split('.')
                    let fileName = value.slice(0, -fName[fName.length - 1].length - 1)
                    if (process.platform == 'win32') {
                        fileName = fileName.substr(fileName.lastIndexOf('\\') + 1)
                    } else {
                        fileName = fileName.substr(fileName.lastIndexOf('/') + 1);
                    }
                    let title = fileName;
                    let artist = 'Unknown Artist';
                    let album = 'Unknown Album';
                    if (library[value].title) title = library[value].title;
                    if (library[value].artist) artist = library[value].artist;
                    if (library[value].album) album = library[value].album;
                    songIndex.push({
                        'file': value,
                        'title': title,
                        'artist': artist,
                        'album': album,
                        'songId': library[value].id,
                        'id': numCount
                    });
                    if (artistsUsed.indexOf(artist) == -1 && artist != "Unknown Artist") {
                        artistList.push({
                            'artist': artist
                        });
                        artistsUsed.push(artist)
                    }
                    if (albumsUsed.indexOf(album) == -1 && album != "Unknown Album") {
                        albumList.push({
                            'album': album,
                            'artist': artist
                        });
                        albumsUsed.push(album)
                    }
                    numCount++;
                });
                resolve([songIndex, artistList, albumList])
            });
            let list = await genList;
            win.webContents.send('getlibrary', list);
        })
    })

    ipcMain.on('addToLibrary', async (event, locations) => {
        let songs = await files.addFiles(locations)
        db.addToLibrary(songs)
        let library = db.getLibrary()
        win.webContents.send('library', library)
    })

    ipcMain.on('library', async () => {
        let library = db.getLibrary()
        win.webContents.send('library', library)
    })

    win.on('ready-to-show', () => {
        win.show()
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

    win.on('closed', () => {
        win = null
    })

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    registerLocalResourceProtocol();
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
            console.log('installed!')
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})

function registerLocalResourceProtocol() {
    protocol.registerFileProtocol('local-resource', (request, callback) => {
        const url = request.url.replace(/^local-resource:\/\//, '')
        // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
        const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
        try {
            return callback(decodedUrl)
        } catch (error) {
            console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
        }
    })
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}