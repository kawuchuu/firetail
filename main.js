const {app, BrowserWindow, dialog} = require('electron');
const path = require('path');
const url = require('url');

var win;
var frameStyle;
var ipc = require('electron').ipcMain

if (process.platform === 'linux') {
    frameStyle = true;
} else {
    frameStyle = false;
}

function createWindow() {
    win = new BrowserWindow({
        width: 1080, 
        height: 889,
        icon: './assets/image/audiation-main-logo.png', 
        frame: frameStyle,
        backgroundColor: '#1f1f1f',
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
        ipc.on('playbackstatus', (event, arg) => {
            mprisPlayer.playbackStatus = arg;
        });
    }

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    win.setMenuBarVisibility(false);
    process.on('unhandledRejection', function(err) {
        dialog.showErrorBox('Error', err)
    })
    process.on('unhandledException', function(err) {
        dialog.showErrorBox('Error', err)
    })
    win.once('ready-to-show', () => {
        win.show();
    })
    // If Audiation fails to start, uncomment the line below to find the cause. If it's an error on my behalf, please report it ASAP
    //win.webContents.toggleDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
})