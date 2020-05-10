const {app, BrowserWindow, Menu, Tray} = require('electron');
const path = require('path');
const url = require('url');
const express = require('express');

let imgServer = express();
imgServer.use(express.static(`${app.getPath('userData')}/images/`));
console.log(`${app.getPath('userData')}/images/`)
imgServer.listen(56743, 'localhost', (err) => {
    if (err) return console.log(err);
    console.log('Image server running on: http://localhost:56743');
});

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('force-color-profile', 'srgb');
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

function createMainWindow() {
    let win = new BrowserWindow({
        width: 970, 
        height: 600,
        minWidth: 650,
        minHeight: 375,
        frame: true,
        backgroundColor: '#1f1f1f',
        show: false,
        title: 'Firetail',
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true
        }
    });
    if (!app.isPackaged) {
        switch(process.platform) {
            case "win32":
                win.setIcon('./assets/icon.ico');
                break;
            case "linux":
                win.setIcon('./assets/firetail-idea.png');
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
            win.show();
        }},
        { label: 'Quit Firetail',  id: 'exit', click: () => { app.exit(0); } }
    ])
    tray.setContextMenu(contextMenu);
    tray.setToolTip('Firetail')
    tray.on('click', function() {
        if (mini == false) {
            win.show();
        }
    });

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
    win.loadURL(url.format({
        pathname: path.join(__dirname, './src/main.html'),
        protocol: 'file:',
        slashes: true
    }));
    win.setMenuBarVisibility(false);
    win.once('ready-to-show', () => {
        if (app.commandLine.hasSwitch('enable-mobile-ui')) {
            win.webContents.executeJavaScript(`document.head.innerHTML += '<link rel="stylesheet" href="./mobile.css">'`);
            win.setMinimumSize(416, 375);
        }
        if (app.commandLine.hasSwitch('enable-light-theme')) {
            win.webContents.executeJavaScript(`document.querySelector('html').classList.replace('dark', 'light')`)
        }
        win.show();
    })
    win.on('closed', (i) => {
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
                            win.webContents.send('msg', ['playpause']);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Next',
                        accelerator: 'Cmd+Right',
                        click() {
                            win.webContents.send('msg', ['skip']);
                        }
                    },
                    {
                        label: 'Previous',
                        accelerator: 'Cmd+Left',
                        click() {
                            win.webContents.send('msg', ['prev']);
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Shuffle',
                        accelerator: 'Cmd+S',
                        click() {
                            win.webContents.send('msg', ['shuffle']);
                        }
                    },
                    {
                        label: 'Repeat',
                        accelerator: 'Cmd+R',
                        click() {
                            win.webContents.send('msg', ['repeat']);
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
                            win.webContents.toggleDevTools();
                        }
                    },
                    {
                        label: 'Reload Firetail',
                        accelerator: 'Cmd+Alt+R',
                        click() {
                            win.webContents.reload();
                        }
                    }
                ]
            }
        ]
        let menu = Menu.buildFromTemplate(appMenu);
        Menu.setApplicationMenu(menu)
    }
}

/* function createMiniPlayer() {
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
} */
function createWindows() {
    createMainWindow();
    //createMiniPlayer();
}

app.on('ready', createWindows);