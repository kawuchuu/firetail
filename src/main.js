const {
  app,
  protocol,
  BrowserWindow,
  Menu,
  nativeTheme,
  session
} = require('electron');
const path = require('path');
import * as musicMetadata from 'music-metadata'
import server from './modules/server'
import {
  existsSync
} from 'fs'
import ipc from './modules/ipc'
import installExtension, {
  VUEJS_DEVTOOLS
} from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const osType = process.platform
  const mainWindow = new BrowserWindow({
    width: 1350,
    height: 815,
    minWidth: 750,
    minHeight: 400,
    show: false,
    titleBarStyle: osType === 'darwin' || osType === 'win32' ? 'hidden' : 'default',
    trafficLightPosition: {
      x: 25,
      y: 17
    },
    frame: osType === 'darwin' || osType === 'win32' ? false : true,
    backgroundColor: 'transparent',
    title: 'Firetail',
    webPreferences: {
      preload: path.join(__dirname, '../renderer/main_window/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableBlinkFeatures: "OverlayScrollbars",
      disableBlinkFeatures: "Auxclick"
    },
    titleBarOverlay: {
      height: 44,
      width: 150,
      color: '#000000',
      symbolColor: '#ffffff'
    }
  });

  //lock app
  if (app.isPackaged || app.commandLine.hasSwitch('enable-instance-lock')) {
    const getLock = app.requestSingleInstanceLock()
    if (!getLock) {
      app.quit()
    } else {
      if (process.platform == 'win32') {
        app.on('second-instance', (event, args) => {
          if (mainWindow) {
            openSong(args[args.length - 1])
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
          } else {
            launchSong = args[args.length - 1]
          }
        })
      }
    }
  } else {
    console.log('App is not packaged... skipping second instance lock')
  }

  if (isDevelopment) {
    if (osType == 'darwin') {
      app.dock.setIcon(path.resolve(__dirname, 'static/main/macos.png'))
    }
    app.setName('Firetail')
/*     if (!app.commandLine.hasSwitch('enable-instance-lock')) {
      server.startServer(app.getPath('userData'), win)
    } */
    mainWindow.setIcon(`${__dirname}/static/main/icon.png`)
  } else if (process.platform == 'linux') {
    mainWindow.setIcon(`${__dirname}/static/main/icon.png`)
  }

  // functionality is missing, will be implemented in the future
  const macMenu = [{
      label: 'Firetail',
      submenu: [{
          label: 'About Firetail',
          selector: 'orderFrontStandardAboutPanel:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Settings',
          accelerator: 'Command+,',
          click() {
            mainWindow.webContents.send('control', 'preferences')
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideOthers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'File',
      submenu: [{
          label: 'Add Songs',
        },
        {
          label: 'Create Playlist'
        }
      ]
    },
    {
      role: 'editMenu'
    },
    {
      label: 'View',
      submenu: [{
          role: 'resetZoom'
        },
        {
          role: 'zoomIn'
        },
        {
          role: 'zoomOut'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen',
          label: 'Enter Full Screen'
        },
        {
          type: 'separator'
        },
        {
          label: 'Developer',
          submenu: [{
              role: 'reload'
            },
            {
              role: 'forceReload'
            },
            {
              role: 'toggleDevTools'
            }
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
            mainWindow.webContents.send('control', 'playPause')
          }
        },
        {
          label: 'Stop',
          accelerator: 'Command+.',
          click() {
            mainWindow.webContents.send('control', 'stop')
          }
        },
        {
          label: 'Next',
          accelerator: 'Command+Right',
          click() {
            mainWindow.webContents.send('control', 'next')
          }
        },
        {
          label: 'Previous',
          accelerator: 'Command+Left',
          click() {
            mainWindow.webContents.send('control', 'prev')
          }
        },
        /* {
            label: 'Go to Current Song',
            accelerator: 'Command+L',
            click() {
                mainWindow.webContents.send('control', 'cursong')
            }
        }, */
        {
          type: 'separator'
        },
        {
          label: 'Increase Volume',
          accelerator: 'Command+Up',
          click() {
            mainWindow.webContents.send('control', 'volUp')
          }
        },
        {
          label: 'Decrease Volume',
          accelerator: 'Command+Down',
          click() {
            mainWindow.webContents.send('control', 'volDown')
          }
        },
        {
          label: 'Mute Volume',
          accelerator: 'Shift+Command+M',
          click() {
            mainWindow.webContents.send('control', 'mute')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Shuffle',
          accelerator: 'Command+S',
          click() {
            mainWindow.webContents.send('control', 'shuffle')
          }
        },
        {
          label: 'Repeat',
          accelerator: 'Command+Option+R',
          click() {
            mainWindow.webContents.send('control', 'repeat')
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Back',
          accelerator: 'Command+[',
          click() {
            mainWindow.webContents.send('control', 'backPage')
          }
        },
        {
          label: 'Forward',
          accelerator: 'Command+]',
          click() {
            mainWindow.webContents.send('control', 'forPage')
          }
        }

      ]
    },
    {
      role: 'windowMenu'
    },
    {
      role: 'help',
      submenu: [{
        label: 'GitHub Repository',
        click: async () => {
          const {
            shell
          } = require('electron')
          await shell.openExternal('https://github.com/kawuchuu/firetail')
        }
      }]
    }
  ]

  const menu = Menu.buildFromTemplate(macMenu)
  Menu.setApplicationMenu(menu)

  const openSong = filePath => {
    let lastElement = filePath
    if (process.argv.length >= 1 && lastElement != "dist_electron" && existsSync(lastElement)) {
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
        mainWindow.webContents.send('playCustomSong', info)
      })
    }
  }

  let launchSong = null

  if (process.platform == 'darwin') {
    app.on('open-file', (event, path) => {
      if (mainWindow) {
        openSong(path)
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      } else {
        launchSong = path
      }
    })
  }

  ipc.start(mainWindow)
  server.startServer(app.getPath('userData'), mainWindow)

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (isDevelopment) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('ready-to-show', () => {
    if (launchSong) {
      openSong(launchSong)
    }
    mainWindow.show()
  })

  mainWindow.on('enter-full-screen', () => {
    if (process.platform === 'darwin') return
    mainWindow.webContents.send('fullscreenUpdate', true)
  })
  mainWindow.on('leave-full-screen', () => {
    if (process.platform === 'darwin') return
    mainWindow.webContents.send('fullscreenUpdate', false)
  })

  nativeTheme.on('updated', evt => {
    mainWindow.webContents.send('updateHighContrast', evt.sender.shouldUseHighContrastColors)
  })

  mainWindow.on('blur', () => {
    if (osType == 'win32') {
      mainWindow.setTitleBarOverlay({
        height: 44,
        width: 150,
        color: '#000000',
        symbolColor: '#ffffff80'
      })
    }
  })

  mainWindow.on('focus', () => {
    if (osType == 'win32') {
      mainWindow.setTitleBarOverlay({
        height: 44,
        width: 150,
        color: '#000000',
        symbolColor: '#ffffff'
      })
    }
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({
        requestHeaders: {
          Origin: '*',
          ...details.requestHeaders
        }
      });
    },
  );

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders,
      },
    });
  });
  registerLocalResourceProtocol()
  try {
    await installExtension(VUEJS_DEVTOOLS)
    console.log('Vue Devtools installed!')
  } catch (e) {
    console.error('Vue Devtools failed to install:', e.toString())
  }
  createWindow()
});

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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.