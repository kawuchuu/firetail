const {app, BrowserWindow, Menu, Tray, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const express = require('express');
const os = require('os');

let imgServer = express();
imgServer.use(express.static(`${app.getPath('userData')}/images/`));
console.log(`${app.getPath('userData')}/images/`)
imgServer.listen(56743, 'localhost', (err) => {
    if (err) return console.log(err);
    console.log('Image server running on: http://localhost:56743');
});

let Controls;
let MediaPlaybackType;
let MediaPlaybackStatus;
let SystemMediaTransportControlsButton;
let BackgroundMediaPlayer;
let RandomAccessStreamReference;
let Uri;

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('force-color-profile', 'srgb');
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

let mainWin;

function createMainWindow() {
    mainWin = new BrowserWindow({
        width: 970, 
        height: 600,
        minWidth: 650,
        minHeight: 375,
        frame: true,
        backgroundColor: '#181818',
        show: false,
        title: 'Firetail',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            spellcheck: false
        }
    });
    if (!app.isPackaged) {
        switch(process.platform) {
            case "win32":
                mainWin.setIcon('./assets/icon.ico');
                break;
            case "linux":
                mainWin.setIcon('./assets/firetail-idea.png');
                break;
        }
    }
    let icon = './assets/tray.png';
    if (process.platform == 'darwin') {
        icon = './assets/status-iconTemplate.png' ;
    }
    let iconpath = path.join(__dirname, icon)
    tray = new Tray(iconpath);
    const contextMenu = Menu.buildFromTemplate([
        { label: "Open", id: "open", click: () => {
            mainWin.show();
        }},
        { label: 'Quit Firetail',  id: 'exit', click: () => { app.exit(0); } }
    ])
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Firetail')
    tray.on('click', function() {
        if (mini == false) {
            mainWin.show();
        }
    });

    let contents = mainWin.webContents;
    contents.on("crashed", () => {
        console.log('Renderer has crashed!');
        setTimeout(() => {
            mainWin.loadURL(url.format({
                pathname: path.join(__dirname, './src/crash.html'),
                protocol: 'file:',
                slashes: true
            }));
        }, 200)
    });
    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, './src/main.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWin.setMenuBarVisibility(false);
    mainWin.once('ready-to-show', () => {
        if (app.commandLine.hasSwitch('enable-mobile-ui')) {
            mainWin.webContents.executeJavaScript(`document.head.innerHTML += '<link rel="stylesheet" href="./mobile.css">'`);
            mainWin.setMinimumSize(416, 375);
        }
        if (app.commandLine.hasSwitch('enable-light-theme')) {
            mainWin.webContents.executeJavaScript(`document.querySelector('html').classList.replace('dark', 'light')`)
        }
        mainWin.show();
    })
    mainWin.on('closed', (i) => {
        app.exit();
    });
    if (process.platform == 'darwin') {
        app.setAboutPanelOptions({
            applicationName: 'Firetail',
            applicationVersion: require('./package.json').version,
            copyright: 'Copyright © 2020 projsh_',
            version: require('./package.json').version
        })
        let appMenu = [
            {
                label: app.getName(),
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    {
                        label: 'Preferences',
                        accelerator: 'Cmd+,',
                        click() {
                            mainWin.webContents.send('preferences')
                        }
                    },
                    { type: 'separator' },
                    { role: 'hide' },
                    { role: 'hideothers' },
                    { role: 'unhide' },
                    { type: 'separator' },
                    { role: 'quit' }
                ]
            },
            {
                label: 'Playback',
                submenu: [
                    {
                        label: 'Play / Pause',
                        accelerator: 'Space',
                        click() {
                            mainWin.webContents.send('msg', ['playpause']);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Next',
                        accelerator: 'Cmd+Right',
                        click() {
                            mainWin.webContents.send('msg', ['skip']);
                        }
                    },
                    {
                        label: 'Previous',
                        accelerator: 'Cmd+Left',
                        click() {
                            mainWin.webContents.send('msg', ['prev']);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Shuffle',
                        accelerator: 'Cmd+S',
                        click() {
                            mainWin.webContents.send('msg', ['shuffle']);
                        }
                    },
                    {
                        label: 'Repeat',
                        accelerator: 'Cmd+R',
                        click() {
                            mainWin.webContents.send('msg', ['repeat']);
                        }
                    }
                ]
            },
            {
                role: 'editMenu'
            },
            {
                role: 'window',
                submenu: [
                    { role: 'close' },
                    { role: 'minimize' },
                    { role: 'zoom' },
                    { type: 'separator' },
                    { role: 'front' },
                    { type: 'separator' },
                    {
                        label: 'Toggle Dev Tools',
                        accelerator: 'Cmd+Alt+I',
                        click() {
                            mainWin.webContents.toggleDevTools();
                        }
                    },
                    {
                        label: 'Reload Firetail',
                        accelerator: 'Cmd+Alt+R',
                        click() {
                            mainWin.webContents.reload();
                        }
                    }
                ]
            }
        ]
        let menu = Menu.buildFromTemplate(appMenu);
        Menu.setApplicationMenu(menu)
    }
    if (process.platform == 'win32' && os.release().substr(0,2) == "10") {
        MediaPlaybackStatus = require('@nodert-win10-au/windows.media').MediaPlaybackStatus;
        MediaPlaybackType = require('@nodert-win10-au/windows.media').MediaPlaybackType;
        SystemMediaTransportControlsButton = require('@nodert-win10-au/windows.media').SystemMediaTransportControlsButton;
        BackgroundMediaPlayer = require('@nodert-win10-au/windows.media.playback').BackgroundMediaPlayer;
        RandomAccessStreamReference = require('@nodert-win10-au/windows.storage.streams').RandomAccessStreamReference;
        Uri = require('@nodert-win10-au/windows.foundation').Uri;
        Controls = BackgroundMediaPlayer.current.systemMediaTransportControls;
        Controls.isChannelDownEnabled = false;
        Controls.isChannelUpEnabled = false;
        Controls.isFastForwardEnabled = false;
        Controls.isNextEnabled = true;
        Controls.isPauseEnabled = true;
        Controls.isPlayEnabled = true;
        Controls.isPreviousEnabled = true;
        Controls.isRecordEnabled = false;
        Controls.isRewindEnabled = false;
        Controls.isStopEnabled = false;
        Controls.playbackStatus = MediaPlaybackStatus.closed;
        Controls.displayUpdater.type = MediaPlaybackType.music;
    
        Controls.on('buttonpressed', (sender, args) => {
            switch(args.button) {
                case SystemMediaTransportControlsButton.play:
                    mainWin.webContents.send('msg', ['play']);
                    break;
                case SystemMediaTransportControlsButton.pause:
                    mainWin.webContents.send('msg', ['pause']);
                    break;
                case SystemMediaTransportControlsButton.next:
                    mainWin.webContents.send('msg', ['skip']);
                    break;
                case SystemMediaTransportControlsButton.previous:
                    mainWin.webContents.send('msg', ['prev']);
                    break;
                default:
                    break;
            }
        })
        
        ipcMain.on('win-control', (evt, arg) => {
            switch(arg[0]) {
                case "text":
                    Controls.playbackStatus = MediaPlaybackStatus.playing;
                    Controls.displayUpdater.musicProperties.title = arg[1];
                    Controls.displayUpdater.musicProperties.artist = arg[2];
                    Controls.displayUpdater.musicProperties.albumTitle = arg[3];
                break;
                case "thumb":
                    Controls.displayUpdater.thumbnail = RandomAccessStreamReference.createFromUri(new Uri(`http://localhost:56743/${arg[1]}.jpg`));
                break;
                case "status":
                    if (arg[1] == 'paused') {
                        Controls.playbackStatus = MediaPlaybackStatus.paused;
                    } else {
                        Controls.playbackStatus = MediaPlaybackStatus.playing;
                    }
                break;
            }
            Controls.displayUpdater.update();
        })
    }
}

function createWindows() {
    createMainWindow();
}

app.on('ready', createWindows);