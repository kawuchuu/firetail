'use strict'

import { app, protocol, BrowserWindow, Menu } from 'electron'
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

// functionality is missing, will be implemented in the future
const macMenu = [
    {
        label: 'Firetail',
        submenu: [
            {
                label: 'About Firetail',
                selector: 'orderFrontStandardAboutPanel:'
            },
            { type: 'separator' },
            {
                label: 'Preferences',
                accelerator: 'Command+,',
                click() {
                    win.webContents.send('control', 'preferences')
                }
            },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    },
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Songs',
            },
            {
                label: 'Create Playlist'
            }
        ]
    },
    { role: 'editMenu' },
    {
        label: 'View',
        submenu: [
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { 
                role: 'togglefullscreen',
                label: 'Enter Full Screen'
            },
            { type: 'separator' },
            {
                label: 'Developer',
                submenu: [
                    { role: 'reload' },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' }
                ]
            }
        ]
    },
    {
        label: 'Controls',
        submenu: [
            // this one is still registering when hidden even though acceleratorWorksWhenHidden is false...
            {
                label: 'Play / Pause',
                //accelerator: 'Space',
                acceleratorWorksWhenHidden: false,
                registerAccelerator: false,
                click() {
                    win.webContents.send('control', 'playPause')
                }
            },
            {
                label: 'Stop',
                accelerator: 'Command+.',
                click() {
                    win.webContents.send('control', 'stop')
                }
            },
            {
                label: 'Next',
                accelerator: 'Command+Right',
                click() {
                    win.webContents.send('control', 'next')
                }
            },
            {
                label: 'Previous',
                accelerator: 'Command+Left',
                click() {
                    win.webContents.send('control', 'prev')
                }
            },
            /* {
                label: 'Go to Current Song',
                accelerator: 'Command+L',
                click() {
                    win.webContents.send('control', 'cursong')
                }
            }, */
            { type: 'separator' },
            {
                label: 'Increase Volume',
                accelerator: 'Command+Up',
                click() {
                    win.webContents.send('control', 'volUp')
                }
            },
            {
                label: 'Decrease Volume',
                accelerator: 'Command+Down',
                click() {
                    win.webContents.send('control', 'volDown')
                }
            },
            {
                label: 'Mute Volume',
                accelerator: 'Shift+Command+M',
                click() {
                    win.webContents.send('control', 'mute')
                }
            },
            { type: 'separator' },
            {
                label: 'Shuffle',
                accelerator: 'Command+S',
                click() {
                    win.webContents.send('control', 'shuffle')
                }
            },
            {
                label: 'Repeat',
                accelerator: 'Command+Option+R',
                click() {
                    win.webContents.send('control', 'repeat')
                }
            },
            { type: 'separator' },
            {
                label: 'Back',
                accelerator: 'Command+[',
                click() {
                    win.webContents.send('control', 'backPage')
                }
            },
            {
                label: 'Forward',
                accelerator: 'Command+]',
                click() {
                    win.webContents.send('control', 'forPage')
                }
            }

        ]
    },
    { role: 'windowMenu' },
    {
        role: 'help',
        submenu: [
            {
                label: 'GitHub Repository',
                click: async() => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://github.com/kawuchuu/firetail')
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(macMenu)
Menu.setApplicationMenu(menu)

app.commandLine.appendSwitch("enable-transparent-visuals");
async function createWindow() {
    // Create the browser window.
    const osType = process.platform
    const winConfig = {
        width: 1350,
        height: 750,
        minWidth: 750,
        minHeight: 400,
        show: false,
        titleBarStyle: osType === 'darwin' ? 'hiddenInset' : 'default',
        frame: osType === 'darwin' ? false : true,
        //backgroundColor: osType === 'darwin' ? 'transparent' : '#181818',
        backgroundColor: '#18171c',
        title: 'Firetail',
        //transparent: osType === 'darwin' ? true : false,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
            enableBlinkFeatures: "CSSColorSchemeUARendering",
        }
    }
    win = new BrowserWindow(winConfig)
    let openSong = filePath => {
        let lastElement = filePath
        if (process.argv.length >= 1  && lastElement != "dist_electron" && existsSync(lastElement)) {
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
        if (process.platform === 'darwin') return
        win.webContents.send('fullscreenUpdate', true)
    })
    win.on('leave-full-screen', () => {
        if (process.platform === 'darwin') return
        win.webContents.send('fullscreenUpdate', false)
    })
    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        //await win.loadURL('about:blank')
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
