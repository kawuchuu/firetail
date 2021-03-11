import Database from 'better-sqlite3'
import {app} from 'electron'

const db = new Database(`${app.getPath('userData')}/library.db`)
db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, album text, duration decimal, path text, id text, hasImage integer, trackNum integer, year text)').run()
db.prepare('CREATE TABLE IF NOT EXISTS favourites (id text)').run()
db.prepare('CREATE TABLE IF NOT EXISTS spotify (clientID text, refreshToken text, clientAuth text, curValidToken text)').run()
if (db.prepare('SELECT COUNT(*) FROM spotify').get()['COUNT(*)'] == 0) {
    db.prepare('INSERT INTO spotify DEFAULT VALUES').run()
}

export default {
    addToLibrary(songs) {
        let existingSongs = this.getLibrary()
        let insert = db.prepare(`INSERT INTO library (title, artist, album, duration, path, id, hasImage, trackNum, year) VALUES (@title, @artist, @album, @duration, @path, @id, @hasImage, @trackNum, @year)`)
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
    getAllFromColumnWithArtist() {
        let rows = db.prepare(`SELECT DISTINCT album FROM library`).all();
        let albumWithArtist = []
        rows.forEach(f => {
            let artist = db.prepare(`SELECT artist,hasImage FROM library WHERE album = ?`).get(f.album);
            albumWithArtist.push({
                album: f.album,
                artist: artist.artist,
                hasImage: artist.hasImage
            })
        })
        return albumWithArtist
    },
    getSomeFromColumn(column, query) {
        if (column == 'artist' || column == 'album') {
            let rows = db.prepare(`SELECT * FROM library WHERE ${column} = ?`).all(query)
            return rows
        } else return []
    },
    getSomeFromMultiColumn(column, query) {
        let columns = []
        column.forEach((f, i) => {
            if (f != 'artist' || f != 'album') return;
            let rows = db.prepare(`SELECT * FROM library WHERE ${f}='${query[i]}'`).all()
            columns.push({
                artist: query[i],
                albums: rows
            })
        })
        return columns
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