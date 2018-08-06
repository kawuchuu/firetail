const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const os = require('os')

var win;
var frameStyle;

if (process.platform === 'Linux') {
    frameStyle = true;
} else {
    frameStyle = false;
}

function createWindow() {
    win = new BrowserWindow({
        width: 1080, 
        height: 889,
        icon: './assets/image/audiation.ico', 
        frame: frameStyle,
        backgroundColor: '#1f1f1f',
        titleBarStyle: 'hidden'
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))
    win.setMenu(null);
    // If Audiation fails to start, uncomment the line below to find the cause. If it's an error on my behalf, please report it ASAP
    //win.webContents.toggleDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
})