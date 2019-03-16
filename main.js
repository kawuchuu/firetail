const {app, BrowserWindow, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');
var settings = require('electron-settings')

var frameStyle;
var bg;
var ipc = require('electron').ipcMain

if (process.platform === 'linux') {
    frameStyle = true;
} else {
    frameStyle = false;
}

if (settings.theme == 'light') {
    bg = '#f5f5f5';
} else {
    bg = '#1f1f1f';
}

function createMainWindow() {
    var win = new BrowserWindow({
        width: 885, 
        height: 655,
        icon: './assets/image/audiation-main-logo.png', 
        frame: frameStyle,
        backgroundColor: bg,
        titleBarStyle: 'hidden',
        show: false,
        title: 'Audiation'
    });

    //thank you victor :)
    if (process.platform == 'linux') {
        var mpris = require('mpris-service');
        let mprisPlayer = new mpris({
            name: 'audiation',
            identity: 'Audiation'
        });
    
        ipc.on('mpris-update', (event, arg) => {
            console.log("mpris-update event triggered");
            if (arg[0] == "metadata" && arg[1]["mpris:trackid"] == null) {
                arg[1]["mpris:trackid"] = mprisPlayer.objectPath('track/0'); //because we can't do this in the renderer
                console.log(arg[1]);
            }
            mprisPlayer[arg[0]] = arg[1];
        });
        mprisPlayer.on('playpause', () => {
            win.webContents.send("playpause");
        });
        mprisPlayer.on('play', () => {
            win.webContents.send("play");
        });
        mprisPlayer.on('next', () => {
            win.webContents.send("next");
        })
        mprisPlayer.on('previous', () => {
            win.webContents.send("previous");
        })
        ipc.on('mprisplaybackstatus', (event, arg) => {
            mprisPlayer.playbackStatus = arg;
        });
    }

    if (process.platform != 'linux') {
        globalShortcut.register('MediaPlayPause', resumeButton);
        globalShortcut.register('MediaPreviousTrack', previousSong);
        globalShortcut.register('MediaNextTrack', nextSong);
    }

    function resumeButton() {
        win.webContents.send("playpause");
    }
    function previousSong() {
        win.webContents.send("previous");
    }
    function nextSong() {
        win.webContents.send("next");
    }

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
    });
    ipc.on('remove-audio-listener', () => {
        win.webContents.send('remove-audio-listener')
    });
    ipc.on('seek-time-main', (event, arg) => {
        win.webContents.send('seek-time-main', arg)
    });
    win.on('maximize', () => {
        win.webContents.send('maximizeWindow');
    })
    win.on('unmaximize', () => {
        win.webContents.send('unmaximizeWindow');
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    win.setMenuBarVisibility(false);
    win.once('ready-to-show', () => {
        win.show();
    })
    win.on('closed', (i) => {
        app.exit();
    })
    
}

function createMiniPlayer() {
    var win = new BrowserWindow({
        width: 385, 
        height: 185,
        icon: './assets/image/audiation-main-logo.png', 
        frame: false,
        backgroundColor: bg,
        show: false,
        title: 'Mini Player',
        alwaysOnTop: true,
        resizable: false
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, './miniplayer/index.html'),
        protocol: 'file:',
        slashes: true
    }))
    win.setMenuBarVisibility(false);
    ipc.on('tag-info', (event, arg) => {
        win.webContents.send('tag-info', arg);
    });
    ipc.on('switch-windows-mini', () => {
        win.webContents.send('switch-windows');
    })
    ipc.on('seek-time-mini', (event, arg) => {
        win.webContents.send('seek-time', arg)
    })
    ipc.on('is-playing', (event, arg) => {
        win.webContents.send('is-playing', arg)
    })
    ipc.on('shuffle-enable', () => {
        win.webContents.send('shuffle-enable')
    });
    ipc.on('repeat-enable', () => {
        win.webContents.send('repeat-enable')
    });
    ipc.on('play-pause-mini', () => {
        win.webContents.send("play-pause-mini");
    });
    ipc.on('play-mini', () => {
        win.webContents.send('play-mini')
    });
}

function createWindows() {
    createMainWindow();
    createMiniPlayer();
}

app.on('ready', createWindows);