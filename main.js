const {app, BrowserWindow, globalShortcut, Menu, Tray} = require('electron');
const path = require('path');
const url = require('url');
var settings = require('electron-settings')

var frameStyle;
var bg;
var ipc = require('electron').ipcMain;
var mini = false;

/*if (settings.get('title-bar') == 'native') {
    frameStyle = true;
} else {
    frameStyle = false;
}

if (settings.theme == 'light') {
    bg = '#f5f5f5';
} else {
    bg = '#1f1f1f';
};*/

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('force-color-profile', 'srgb');

function createMainWindow() {
    var win = new BrowserWindow({
        width: 770, 
        height: 560,
        minWidth: 650,
        minHeight: 375,
        icon: 'assets/icon.ico', 
        frame: true,
        backgroundColor: '#1f1f1f',
        titleBarStyle: 'hidden',
        show: false,
        title: 'Firetail',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });
    let iconpath = path.join(__dirname, './assets/tray.png')
    tray = new Tray(iconpath);
    const contextMenu = Menu.buildFromTemplate([
        { label: "Open", id: "open", click: () => {
            if (mini == false) {
                win.show();
            }
        }},
        { label: 'Quit Firetail',  id: 'exit', click: () => { closeWin() } }
    ])
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Firetail')
    tray.on('click', function() {
        if (mini == false) {
            win.show();
        }
    });
    function closeWin() {
        win.webContents.send('exit-time');
    }
    /* if (process.platform != 'linux') {
        globalShortcut.register('MediaPlayPause', resumeButton);
        globalShortcut.register('MediaPreviousTrack', previousSong);
        globalShortcut.register('MediaNextTrack', nextSong);
    } */

    function resumeButton() {
        win.webContents.send("playpause");
    }
    function previousSong() {
        win.webContents.send("previous");
    }
    function nextSong() {
        win.webContents.send("next");
    }

    let contents = win.webContents;
    contents.on("crashed", () => {
        console.log('Renderer has crashed!');
        setTimeout(() => {
            win.loadURL(url.format({
                pathname: path.join(__dirname, './src/crash.html'),
                protocol: 'file:',
                slashes: true
            }));
        }, 200)
    });

    ipc.on('playpause', (event, arg) => {
        resumeButton();
    });
    ipc.on('play', (event, arg) => {
        win.webContents.send("play");
    });
    ipc.on('next', (event, arg) => {
        nextSong()
    })
    ipc.on('previous', (event, arg) => {
        previousSong();
    })
    ipc.on('shuffle', (event) => {
        win.webContents.send("shuffle");
    })
    ipc.on('repeat', (event) => {
        win.webContents.send("repeat");
    })
    ipc.on('switch-windows-full', () => {
        win.webContents.send('switch-windows');
        mini = false;
    });
    ipc.on('remove-audio-listener', () => {
        win.webContents.send('remove-audio-listener')
    });
    ipc.on('seek-time-main', (event, arg) => {
        win.webContents.send('seek-time-main', arg)
    });
    ipc.on('last-song-time', (event, arg) => {
        if (arg) {
            settings.set('last-song-time', arg);
        }
        app.exit();
    })
    win.on('maximize', () => {
        win.webContents.send('maximizeWindow');
    })
    win.on('unmaximize', () => {
        win.webContents.send('unmaximizeWindow');
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, './src/main.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.setMenuBarVisibility(false);
    win.once('ready-to-show', () => {
        win.show();
    })
    win.on('closed', (i) => {
        app.exit();
    })
    if (process.platform == 'darwin') {
        app.setAboutPanelOptions({
            applicationName: 'Firetail',
            applicationVersion: require('./package.json').version,
            copyright: 'Copyright © 2019 projsh_',
            version: require('./package.json').version
        })
        const appMenu = [
            {
                label: app.getName(),
                submenu: [
                    { role: 'about' },
                    { type: 'separator' },
                    {
                        label: 'Preferences',
                        accelerator: 'Cmd+,',
                        click() {
                            win.webContents.send('preferences')
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
                            resumeButton()
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Next',
                        accelerator: 'Cmd+Right',
                        click() {
                            nextSong()
                        }
                    },
                    {
                        label: 'Previous',
                        accelerator: 'Cmd+Left',
                        click() {
                            previousSong()
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Shuffle',
                        accelerator: 'Cmd+S',
                        click() {
                            win.webContents.send("shuffle");
                        }
                    },
                    {
                        label: 'Repeat',
                        accelerator: 'Cmd+R',
                        click() {
                            win.webContents.send("repeat");
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
                    {
                        label: 'Toggle Mini Player',
                        accelerator: 'Cmd+Shift+M',
                        click() {
                            win.webContents.send('toggle-mp')
                        }
                    },
                    { type: 'separator' },
                    { role: 'front' }
                ]
            }
        ]
        const menu = Menu.buildFromTemplate(appMenu);
        Menu.setApplicationMenu(menu)
    }
}

function createMiniPlayer() {
    var win = new BrowserWindow({
        width: 315, 
        height: 147,
        icon: './assets/icon.png', 
        frame: false,
        backgroundColor: bg,
        show: false,
        title: 'Mini Player',
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }    
    });

    if (app.isPackaged == false) win.setResizable(true);

    win.loadURL(url.format({
        pathname: path.join(__dirname, './src/miniplayer/mini.html'),
        protocol: 'file:',
        slashes: true
    }))
    win.setMenuBarVisibility(false);
    ipc.on('tag-info', (event, arg) => {
        win.webContents.send('tag-info', arg);
    });
    ipc.on('switch-windows-mini', () => {
        win.webContents.send('switch-windows');
        mini = true;
    })
    ipc.on('seek-time-mini', (event, arg) => {
        win.webContents.send('seek-time', arg);
    })
    ipc.on('is-playing', (event, arg) => {
        win.webContents.send('is-playing', arg);
    })
    ipc.on('shuffle-enable', () => {
        win.webContents.send('shuffle-enable');
    });
    ipc.on('repeat-enable', () => {
        win.webContents.send('repeat-enable');
    });
    ipc.on('play-pause-mini', () => {
        win.webContents.send("play-pause-mini");
    });
    ipc.on('play-mini', () => {
        win.webContents.send('play-mini');
    });
    ipc.on('setting-change', (event, arg) => {
        win.webContents.send('setting-change', arg);
    });
    ipc.on('shortcut-close', () => {
        win.webContents.send('shortcut-close');
    });
}

function createWindows() {
    createMainWindow();
    createMiniPlayer();
}

app.on('ready', createWindows);
