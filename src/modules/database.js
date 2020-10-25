import Database from 'better-sqlite3'
import {app} from 'electron'

const db = new Database(`${app.getPath('userData')}/library.db`, {verbose: console.log})
db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, album text, duration decimal, path text, id text, hasImage integer)').run()
db.prepare('CREATE TABLE IF NOT EXISTS favourites (id text)').run()

export default {
    addToLibrary(songs) {
        let existingSongs = this.getLibrary()
        let insert = db.prepare('INSERT INTO library (title, artist, album, duration, path, id, hasImage) VALUES (@title, @artist, @album, @duration, @path, @id, @hasImage)')
        let insertMany = db.transaction((newSongs) => {
            for (let song of newSongs){
                if (existingSongs.map(e => { return e.path }).indexOf(song.path) == -1){
                    insert.run(song)
                }
            }
        })
        insertMany(songs)
    },
    addToFavourite(id) {
        console.log(id)
        db.prepare('INSERT INTO favourites (id) VALUES (?)').run(id)
    },
    removeFromFavourite(id) {
        db.prepare(`DELETE FROM favourites WHERE id = ?`).run(id)
    },
    getFavourites() {
        let rows = db.prepare('SELECT id FROM favourites').all()
        return rows
    },
    getLibrary() {
        let rows = db.prepare('SELECT * FROM library').all()
        return rows
    },
    getAllFromColumn(column) {
        let rows = db.prepare(`SELECT DISTINCT ${column} FROM library`).all()
        return [column, rows]
    },
    getSomeFromColumn(column, query) {
        let rows = db.prepare(`SELECT * FROM library WHERE ${column}='${query}'`).all()
        return rows
    },
    deleteLibrary() {
        db.prepare('DELETE FROM library').run()
        return []
    }
}