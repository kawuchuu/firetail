'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import {
    createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {
    VUEJS_DEVTOOLS
} from 'electron-devtools-installer'
import ipc from './modules/ipc'
const isDevelopment = process.env.NODE_ENV !== 'production'
import server from './modules/server'
import { existsSync } from 'fs'
import * as musicMetadata from 'music-metadata'
import path from 'path'

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
        width: 1350,
        height: 750,
        minWidth: 750,
        minHeight: 400,
        show: false,
        backgroundColor: '#181818',
        title: 'Firetail Next',
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
        }
    })
    let openSong = filePath => {
        let lastElement = filePath
        if (process.argv.length > 1 && existsSync(lastElement) && lastElement != "dist_electron") {
            musicMetadata.parseFile(lastElement).then(meta => {
                let fileName = path.parse(lastElement).name
                let info = {
                    title: meta.common.title ? meta.common.title : fileName,
                    artist: meta.common.artist ? meta.common.artist : "Unknown Artist",
                    album: meta.common.album ? meta.common.album : "Unknown Album",
                    path: lastElement,
                    hasImage: 0,
                    id: 'customSong',
                }
                if (meta.common.picture) {
                    info['customImage'] = `data:image/jpeg;base64,${meta.common.picture[0].data.toString('base64')}`
                    info.hasImage = 1
                }
                win.webContents.send('playCustomSong', info)
            })
        }
    }
    //lock app
    if (app.isPackaged || app.commandLine.hasSwitch('enable-instance-lock')) {
        const getLock = app.requestSingleInstanceLock()
        if (!getLock) {
            app.quit()
        } else {
            server.startServer(app.getPath('userData'), win)
            app.on('second-instance', (event, args) => {
                if (win) {
                    openSong(args[args.length - 1])
                    if (win.isMinimized()) win.restore()
                    win.focus()
                }
            })
        }
    } else {
        console.log('App is not packaged... skipping second instance lock')
    }
    if (isDevelopment) {
        if (!app.commandLine.hasSwitch('enable-instance-lock')) {
            server.startServer(app.getPath('userData'), win)
        }
        win.setIcon(`${__dirname}/../public/icon.png`)
    } else if (process.platform == 'linux') {
        win.setIcon(`${__dirname}/icon.png`)
    }
    ipc.start(win)
    win.setMenuBarVisibility(false)

    win.on('ready-to-show', () => {
        const enableCd = app.commandLine.hasSwitch('enable-cd-burning')
        if (enableCd && process.platform == 'linux') {
            console.log("CD burning is currently very experimental and may not work correctly (I didn't develop the feature). Please proceed with caution.")
            win.webContents.send('enableCDBurn')
            win.webContents.on('did-frame-finish-load', () => {
                win.webContents.send('enableCDBurn')
            })
        }
        win.show()
        openSong(process.argv[process.argv.length - 1])
    })
    win.on('enter-full-screen', () => {
        win.webContents.send('fullscreenUpdate', true)
    })
    win.on('leave-full-screen', () => {
        win.webContents.send('fullscreenUpdate', false)
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
    //if (process.platform !== 'darwin') {
        app.quit()
    //}
})

/* app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
}) */

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