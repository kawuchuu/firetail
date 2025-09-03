import {app, ipcMain, shell, safeStorage} from "electron";
import path from "path/posix";

export default function startIpc() {

    // IMAGES

    ipcMain.handle('getImagePath', () => {
        return path.join(app.getPath('userData').split('\\').join('/'), 'images');
    });

    ipcMain.on('getImagePathSync', (event) => {
        event.returnValue = path.join(app.getPath('userData').split('\\').join('/'), 'images');
    });

    // GENERAL INFO

    ipcMain.handle('getGeneralInfo', () => {
        return {
            version: app.getVersion(),
        }
    });

    // OPEN BROWSER

    ipcMain.on('openBrowser', async (event, url: string) => {
        await shell.openExternal(url);
    });

    // SAFESTORAGE

    ipcMain.handle('encryptString', (event, text: string) => {
        return safeStorage.encryptString(text);
    });

    ipcMain.handle('decryptString', (event, text: Buffer) => {
      return safeStorage.decryptString(text);
    });
}