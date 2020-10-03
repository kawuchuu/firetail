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
        
        ipcMain.on('library', async (event) => {
            console.log(event.sender)
            let library = db.getLibrary()
            win.send('library', library)
        })
        
        ipcMain.on('deleteLibrary', async () => {
            db.deleteLibrary()
            win.send('library', [])
        })
    }
}