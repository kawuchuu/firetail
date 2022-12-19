import { app, ipcMain, shell } from 'electron'
import fs from 'fs'
import db from './database'
import files from './files'
import server from './server'
import BurnJob from './burn'
import { resolve } from 'path'

export default {
    start(win) {
        ipcMain.on('addToLibrary', async (event, locations) => {
            if (locations.length <= 0) return
            win.webContents.send('startOrFinish', true)
            let songs = await files.processFiles(locations)
            db.addToLibrary(songs)
            let library = db.getLibrary()
            win.send('library', library)
        })

        ipcMain.on('library', async () => {
            let library = db.getLibrary()
            win.send('library', library)
        })

        ipcMain.on('deleteLibrary', () => {
            db.deleteLibrary()
            win.send('library', [])
        })

        ipcMain.on('deleteSome', (event, ids) => {
            db.deleteSome(ids)
            let library = db.getLibrary()
            win.send('library', library)
        })

        ipcMain.on('getAllFromColumn', (event, column) => {
            let allColumn = db.getAllFromColumn(column)
            win.send('getAllFromColumn', allColumn)
        })

        ipcMain.on('getSomeFromColumn', (event, args) => {
            let someColumn = db.getSomeFromColumn(args[0], args[1])
            event.reply('library', someColumn)
        })

        ipcMain.handle('getSomeFromColumnMatches', (event, args) => {
            let someColumn = db.getSomeFromColumnMatches(args)
            return someColumn
            //event.reply('library', someColumn)
        })

        ipcMain.on('addFavourite', (event, id) => {
            db.addToFavourite(id)
            let favourites = db.getFavourites()
            event.reply('getFavourites', favourites)
        })

        ipcMain.on('removeFavourite', (event, id) => {
            db.removeFromFavourite(id)
            let favourites = db.getFavourites()
            event.reply('getFavourites', favourites)
        })

        ipcMain.on('getFavourites', event => {
            let favourites = db.getFavourites()
            event.reply('getFavourites', favourites)
        })

        ipcMain.handle('hasCustomLanguage', () => {
            if (app.commandLine.hasSwitch('lang')) {
                let locale = app.commandLine.getSwitchValue('lang')
                return locale
            } else {
                return false
            }
        })

        ipcMain.on('openLink', (event, link) => {
            shell.openExternal(link)
        })

        ipcMain.handle('getSpotifyDetails', () => {
            return db.fetchSpotifyDetails()
        })

        ipcMain.handle('getVersion', () => {
            let ver = app.getVersion()
            return ver
        })

        ipcMain.handle('getBuildNum', async () => {
            let buildNum = 'unknown'
            if (app.isPackaged) {
                buildNum = (await fs.promises.readFile(`${__dirname}/build.txt`)).toString()
            } else {
                buildNum = 'dev'
            }
            return buildNum
        })

        ipcMain.handle('getPort', () => {
            return server.app.get('port')
        })

        ipcMain.handle('canBurn', async () => {
            return await BurnJob.canBurn();
        });

        ipcMain.handle('burn', (event, options) => {
            console.log("burn job requested");

            //TODO: make sure we're on Linux
            if (process.platform === "linux") {
                let burnJob = new BurnJob(options, event.sender);
                return burnJob.id;
            } else {
                return null;
            }
        });

        ipcMain.handle('getSomeFromMultiColumn', (event, args) => {
            let columns = db.getSomeFromMultiColumn(args[0], args[1])
            return columns
        })

        ipcMain.on('getAllFromColumnWithArtist', () => {
            let albumWithArtist = db.getAllFromColumnWithArtist()
            win.send('getAllWithColumnArtist', albumWithArtist)
        })

        win.webContents.on('did-navigate-in-page', () => {
            const checkNav = {
                back: win.webContents.canGoBack(),
                forward: win.webContents.canGoForward()
            }
            win.send('updateNav', checkNav)
        })

        ipcMain.on('clearHistory', () => {
            win.webContents.executeJavaScript("history.pushState({}, '', location.href)");
            win.webContents.clearHistory()
        })

        ipcMain.handle('createPlaylist', (event, playlist) => {
            const randomString = length => {
                let text = ''
                let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                for (let i = 0; i < length; i++) {
                    text += characters.charAt(Math.floor(Math.random() * characters.length))
                }
                return text
            }
            db.createPlaylist({
                name: playlist.name,
                desc: playlist.desc,
                id: randomString(8),
                songIds: JSON.stringify([]),
                buffer: playlist.buffer
            })
            return db.getAllPlaylists()
        })

        ipcMain.handle('getAllPlaylists', () => {
            return db.getAllPlaylists()
        })

        ipcMain.handle('getSpecificPlaylist', (event, id) => {
            return db.getSpecificPlaylist(id)
        })

        ipcMain.handle('updatePlaylist', (event, playlist) => {
            console.log(playlist)
            return db.updatePlaylist(playlist.column, playlist.id, playlist.data)
        })

        ipcMain.handle('deletePlaylist', async (event, id) => {
            try {
                const image = resolve(app.getPath('userData'), `images/playlist/${id}.jpg`)
                await fs.promises.access(image, fs.constants.R_OK | fs.constants.W_OK)
                await fs.promises.unlink(image)
            } catch(e) {''}
            return db.deletePlaylist(id)
        })

        ipcMain.handle('createPlaylistImage', (event, imageInfo) => {
            files.savePlaylistImage(imageInfo.buffer, imageInfo.id)
            return
        })

        ipcMain.handle('getAdvancedFileInfo', async (event, path) => {
            const { format } = await require('music-metadata').parseFile(path)
            return {
                container: format.container,
                codec: format.codec,
                bitrate: format.bitrate,
                sampleRate: format.sampleRate,
                bitDepth: format.bitsPerSample,
                noChannels: format.numberOfChannels
            }
        })

        ipcMain.on('do-custom-window-action', (event, action) => {
            switch(action) {
                case "minimize":
                    win.minimize()
                    break
                case "unmaximize":
                    win.unmaximize()
                    break
                case "maximize":
                    win.maximize()
                    break
                case "close":
                    win.close()
                    break
            }
        })

        ipcMain.handle('is-maximized', () => { return win.isMaximized() })

        win.on('maximize', () => {
            win.webContents.send('change-maximize-button', 'unmaximise')
        })

        win.on('unmaximize', () => {
            win.webContents.send('change-maximize-button', 'maximise')
        })
    }
}