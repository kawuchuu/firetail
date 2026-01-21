import {app, BrowserWindow, protocol, net} from 'electron';
import path from 'path/posix';
import Database from "./modules/database";
import FiretailStorage from "./modules/storage";
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import startIpc from "./modules/ipc";
import { stat as pstat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import {Mime} from 'mime/lite';
import standardTypes from 'mime/types/standard.js';
import otherTypes from 'mime/types/other.js';
import {initMPRIS} from "./modules/mpris";

protocol.registerSchemesAsPrivileged([{
  scheme: 'media',
  privileges: {
    standard: true,
    secure: true,
    supportFetchAPI: true,
    corsEnabled: true,
    stream: true
  }
}]);

app.setName('firetail');

// manually redefining some mime types to ensure content-type is correct
export const mime = new Mime(standardTypes, otherTypes);
mime.define({'audio/flac': ['flac']}, true);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,MediaSessionService');
}

export let mainWindow:BrowserWindow;
const createWindow = () => {
  const database = new Database();
  const osType = process.platform;
  const ftStore = new FiretailStorage();
  initMPRIS();
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

  mainWindow.setMenuBarVisibility(false);

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
  setupLocalResourceProtocol();
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
// holy fuck this was annoying, seems to work now. needs more testing though
function setupLocalResourceProtocol() {
  protocol.handle('media', async (request) => {
    try {
      const filePath = mediaUrlToPath(request.url);
      const stat = await pstat(filePath);
      if (!stat.isFile()) return new Response('not a file', { status: 400 });
      const range = request.headers.get('range');
      const headers: Record<string, string> = {
        'Accept-Ranges': 'bytes',
        'Vary': 'Range',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': mime.getType(path.extname(filePath))
      };
      if (request.method === 'HEAD') {
        headers['Content-Length'] = String(stat.size);
        return new Response(null, { status: 200, headers });
      }
      if (range?.startsWith('bytes=')) {
        const { start, end } = parseRange(range, stat.size);
        if (start > end || start >= stat.size) {
          return new Response('incorrect range', {
            status: 416,
            headers: { 'Content-Range': `bytes */${stat.size}` },
          });
        }
        const node = createReadStream(filePath, { start, end });
        headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
        headers['Content-Length'] = String(end - start + 1);
        return new Response(Readable.toWeb(node) as any, { status: 206, headers });
      }
      const node = createReadStream(filePath);
      headers['Content-Length'] = String(stat.size);
      return new Response(Readable.toWeb(node) as any, { status: 200, headers });
    } catch(err) {
      console.error(err);
      const code = err?.code === 'ENOENT' ? 404 : 500;
      return new Response('internal error', { status: code });
    }
  });
}

// handling all the many different path formats (thanks windows for being non-standard)
function mediaUrlToPath(thing: string) {
  const url = new URL(thing);
  const hostname = url.hostname;
  const pathname = decodeURIComponent(url.pathname || '');
  if (process.platform !== 'win32') return hostname ? `/${hostname}${pathname}` : pathname;
  if (hostname && !/^[a-zA-Z]$/.test(hostname)) return `\\\\${hostname}${pathname.replace(/\//g, '\\')}`;
  if (/^\/[a-zA-Z]:\//.test(pathname)) return pathname.slice(1).replace(/\//g, '\\');
  if (hostname && /^[a-zA-Z]$/.test(hostname)) {
    const rest = pathname.replace(/^\//, '').replace(/\//g, '\\');
    return `${hostname.toUpperCase()}:\\${rest}`;
  }
  let p = pathname.replace(/\//g, '\\');
  if (/^\\[a-zA-Z]:/.test(p)) p = p.slice(1);
  return p;
}

// getting the correct content-range
function parseRange(h: string, size: number) {
  const [, spec] = h.split('=');
  const [a, b] = spec.split(',')[0].trim().split('-');
  let start = a ? Number(a) : NaN;
  let end   = b ? Number(b) : NaN;
  if (Number.isNaN(start) && !Number.isNaN(end)) {
    const n = Math.max(0, Math.min(end, size));
    start = size - n; end = size - 1;
  } else {
    if (Number.isNaN(start) || start < 0) start = 0;
    if (Number.isNaN(end) || end >= size) end = size - 1;
  }
  return { start, end };
}