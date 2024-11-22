import {app, ipcMain} from "electron";
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
}