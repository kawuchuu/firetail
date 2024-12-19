import { app, ipcMain, nativeTheme, shell, Menu } from 'electron'
import fs from 'fs'
import {promises as fsPromises} from 'fs'
import db from './database'
import files from './files'
import server from './server'
import { resolve } from 'path'
import os from 'os'
import {marked} from "marked";
import FiretailStorage from "./storage";
import * as musicMetadata from 'music-metadata'

export default {
    start(win) {
        const ftStorage = new FiretailStorage()

        ipcMain.on('addToLibrary', async (event, locations) => {
            if (locations[0].length <= 0) return
            win.webContents.send('startOrFinish', true)
            let songs = await files.processFiles(locations[0])
            const performAddFiles = await files.addFiles(songs)
            //console.log(performAddFiles)
            db.addToLibrary(performAddFiles)
            if (locations[1] == '/songs') {
                let library = db.getLibrary()
                win.send('library', library)
            }
        })

        ipcMain.on('library', async () => {
            let library = db.getLibrary()
            win.send('library', library)
        })

        ipcMain.on('getFavouriteSongs', async () => {
            let favouriteSongs = await db.getAllFavouriteSongs()
            win.send('library', favouriteSongs)
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
            const metadata = await musicMetadata.parseFile(path)
            return {
                container: metadata.format.container,
                codec: metadata.format.codec,
                bitrate: metadata.format.bitrate,
                sampleRate: metadata.format.sampleRate,
                bitDepth: metadata.format.bitsPerSample,
                noChannels: metadata.format.numberOfChannels
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

        /* win.on('maximize', () => {
            win.webContents.send('change-maximize-button', 'unmaximise')
        })

        win.on('unmaximize', () => {
            win.webContents.send('change-maximize-button', 'maximise')
        }) */

        win.on('blur', () => {
            win.webContents.send('window-blur', true)
        })

        win.on('focus', () => {
            win.webContents.send('window-blur', false)
        })

        ipcMain.handle('isHighContrastEnabled', () => { return nativeTheme.shouldUseHighContrastColors })

        ipcMain.handle('open-file-in-explorer', (evt, path) => {
            let command = ''
            switch(process.platform) {
                case "win32":
                    command = 'explorer /e,/select,'
                    break
            }
            require('child_process').exec(`${command}"${resolve(path)}"`)
        })

        ipcMain.handle('do-full-query', (event, query) => {
            const result = db.doFullQuery(query)
            return result
        })

        ipcMain.on('set-fullscreen', (event, doSwitch) => {
            win.setFullScreen(doSwitch)
        })

        ipcMain.handle('os-version', () => {
            return os.release()
        })

        ipcMain.on('colour-theme-change', (event, colours) => {
            win.currentThemeColours = colours
            if (process.platform === 'win32') {
                win.setTitleBarOverlay({
                    height: 44,
                    width: 150,
                    color: colours.bg,
                    symbolColor: colours.fg
                })
            }
        })

        ipcMain.handle('parse-markdown', async (event, file) => {
            const markdown = await fsPromises.readFile(resolve(__dirname, 'static/main/' + file))
            return marked.parse(markdown.toString())
        })

        ipcMain.handle('getKey', (event, key) => {
            return ftStorage.getItem(key)
        })

        ipcMain.on('setKey', (event, values) => {
            ftStorage.setKey(values[0], values[1], values[2])
        })

        ipcMain.on('deleteKey', (event, key) => {
            ftStorage.deleteKey(key)
        })

        ipcMain.handle('keyExists', (event, key) => {
            return ftStorage.keyExists(key)
        })

        ipcMain.handle('keys', () => {
            return ftStorage.keys
        })

        ipcMain.handle('getCategory', (event, category) => {
            return ftStorage.getCategory(category)
        })

        ipcMain.on('getKeySync', (event, key) => {
            try {
                event.returnValue = ftStorage.getItem(key);
            } catch(err) {
                event.returnValue = null;
            }
        })

        ipcMain.on('keyExistsSync', (event, key) => {
            try {
                event.returnValue = ftStorage.keyExists(key);
            } catch(err) {
                event.returnValue = null;
            }
        })

        ipcMain.on('getCategorySync', (event, category) => {
            try {
                event.returnValue = ftStorage.getCategory(category);
            } catch(err) {
                event.returnValue = null;
            }
        })

        ipcMain.on('createPopup', (event, options) => {
            const menu = Menu.buildFromTemplate(options)
            menu.popup()
        })

        ipcMain.on('addStatPlay', (event, id) => {
            db.addStatPlay(id)
        })

        ipcMain.handle('getMostPlayed', () => {
            return db.getMostPlayed()
        })

        ipcMain.handle('getRecentlyPlayed', () => {
            return db.getRecentlyPlayed()
        })

        ipcMain.handle('getAllGenres', () => {
            return db.getGenres()
        })

        ipcMain.handle('getGenreResults', (event, genre) => {
            return db.getGenreResults(genre)
        })
    }
}