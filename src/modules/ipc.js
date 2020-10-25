import {ipcMain} from 'electron'
import db from './database'
import files from './files'

export default {
    start(win) {
        ipcMain.on('addToLibrary', async (event, locations) => {
            let songs = await files.addFiles(locations)
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

        ipcMain.on('getAllFromColumn', (event, column) => {
            console.log(column)
            let allColumn = db.getAllFromColumn(column)
            win.send('getAllFromColumn', allColumn)
        })

        ipcMain.on('getSomeFromColumn', (event, args) => {
            let someColumn = db.getSomeFromColumn(args[0], args[1])
            console.log('working')
            event.reply('library', someColumn)
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
    }
}