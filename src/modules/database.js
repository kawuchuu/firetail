import Database from 'better-sqlite3'
import {app} from 'electron'

const db = new Database(`${app.getPath('userData')}/library.db`, {verbose: console.log})
db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, album text, duration decimal, path text)').run()

export default {
    addToLibrary(songs) {
        let existingSongs = this.getLibrary()
        let insert = db.prepare('INSERT INTO library (title, artist, album, duration, path) VALUES (@title, @artist, @album, @duration, @path)')
        let insertMany = db.transaction((newSongs) => {
            for (let song of newSongs){
                if (existingSongs.map(e => { return e.path }).indexOf(song.path) == -1){
                    insert.run(song)
                }
            }
        })
        insertMany(songs)
    },
    getLibrary() {
        let rows = db.prepare('SELECT * FROM library').all()
        return rows
    },
    deleteLibrary() {
        db.prepare('DELETE FROM library').run()
        return []
    }
}