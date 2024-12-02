import {app, BrowserWindow, protocol} from 'electron';
import path from 'path/posix';
import Database from "./modules/database";
import FiretailStorage from "./modules/storage";
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import startIpc from "./modules/ipc";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
export let mainWindow:BrowserWindow;
const createWindow = () => {
  const database = new Database();
  const osType = process.platform;
  const ftStore = new FiretailStorage();

  // Create the browser window.
  mainWindow = new BrowserWindow({
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
    frame: !(osType === 'darwin' || osType === 'win32'),
    title: "Firetail",
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      disableBlinkFeatures: "Auxclick"
    },
    titleBarOverlay: {
      height: 44,
      color: '#000000',
      symbolColor: '#ffffff'
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  startIpc();

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'audio-resource',
    privileges: {
      standard: false,
      bypassCSP: true,
    },
  },
]);

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'local-resource',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true
    },
  },
]);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const thing = app.setAsDefaultProtocolClient('firetail');
  if (thing) {
    console.log('DONE WOO')
  } else console.log("NOT DONE NO")
  try {
    await installExtension(VUEJS_DEVTOOLS)
    console.log('Vue Devtools installed!')
  } catch (e) {
    console.error('Vue Devtools failed to install:', e.toString())
  }
  registerLocalResourceProtocol();
  createWindow();
});

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

function registerLocalResourceProtocol() {
  /*protocol.handle('local-resource', async (request: GlobalRequest) => {
    const filePath = decodeURIComponent(request.url.slice('local-resource://'.length))
    console.log(request.url);
    return net.fetch(url.pathToFileURL(filePath).toString())
  })*/
  // ughhh this is being deprecated and i haven't found a great solution to this yet
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = decodeURIComponent(request.url.replace(/^local-resource:\/\//, ''))
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
    try {
      return callback(decodedUrl)
    } catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
