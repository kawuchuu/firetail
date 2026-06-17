//ipc.ts
import {app, ipcMain, shell, safeStorage} from "electron";
import path from "path/posix";
import {readdirSync, readFileSync} from "fs";

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

    // PATH

    ipcMain.handle('pathJoin', (event, ...paths: string[]) => {
        return path.join(...paths);
    });

    // PLUGINS

    ipcMain.handle('getPluginsDir', () => {
        return path.join(app.getPath('userData'), 'plugins');
    });

    ipcMain.handle('getPluginManifests', () => {
        const pluginsDir = path.join(app.getPath('userData'), 'plugins');
        try {
            return readdirSync(pluginsDir, { withFileTypes: true })
                .filter(e => e.isDirectory())
                .map(e => {
                    const manifestPath = path.join(pluginsDir, e.name, 'manifest.json')
                    const source = readFileSync(manifestPath, 'utf-8')
                    return { pluginDir: path.join(pluginsDir, e.name), manifest: JSON.parse(source) }
                });
        } catch {
            return [];
        }
    });

    ipcMain.handle('readPluginFile', (_event, filePath: string) => {
        const pluginsDir = path.join(app.getPath('userData'), 'plugins');
        if (!filePath.startsWith(pluginsDir)) throw new Error('Access denied');
        return readFileSync(filePath, 'utf-8');
    });
}