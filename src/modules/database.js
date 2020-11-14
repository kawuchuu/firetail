import Database from 'better-sqlite3'
import {app} from 'electron'

const db = new Database(`${app.getPath('userData')}/library.db`, {verbose: console.log})
db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, album text, duration decimal, path text, id text, hasImage integer)').run()
db.prepare('CREATE TABLE IF NOT EXISTS favourites (id text)').run()
db.prepare('CREATE TABLE IF NOT EXISTS spotify (clientID text, refreshToken text, clientAuth text, curValidToken text)').run()
if (db.prepare('SELECT COUNT(*) FROM spotify').get()['COUNT(*)'] == 0) {
    db.prepare('INSERT INTO spotify DEFAULT VALUES').run()
}

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
        if (column == 'artist' || column == 'album') {
            let rows = db.prepare(`SELECT DISTINCT ${column} FROM library`).all()
            return [column, rows]
        } else return []
    },
    getSomeFromColumn(column, query) {
        if (column == 'artist' || column == 'album') {
            let rows = db.prepare(`SELECT * FROM library WHERE ${column}='${query}'`).all()
            return rows
        } else return []
    },
    deleteLibrary() {
        db.prepare('DELETE FROM library').run()
        return []
    },
    fetchSpotifyDetails() {
        let spotifyData = db.prepare('SELECT * FROM spotify').get()
        return spotifyData
    },
    updateSpotifyClientIDField(value) {
        let rows = db.prepare('UPDATE spotify SET (clientID)=?;').run(value)
        return rows
    },
    updateSpotifyClientAuthField(value) {
        let rows = db.prepare('UPDATE spotify SET (clientAuth)=?;').run(value)
        return rows
    },
    updateSpotifyRefreshTokenField(value) {
        let rows = db.prepare('UPDATE spotify SET (refreshToken)=?;').run(value)
        return rows
    },
    updateSpotifyCurrentValidTokenField(value) {
        let rows = db.prepare('UPDATE spotify SET (curValidToken)=?;').run(value)
        return rows
    }
}