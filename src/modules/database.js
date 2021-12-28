import Database from 'better-sqlite3'
import {app} from 'electron'
import files from './files'

const db = new Database(`${app.getPath('userData')}/library.db`, { verbose: console.log })
db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, album text, duration decimal, path text, id text, hasImage integer, trackNum integer, year text, disc integer)').run()
db.prepare('CREATE TABLE IF NOT EXISTS favourites (id text)').run()
db.prepare('CREATE TABLE IF NOT EXISTS playlists (name text, desc text, id text, songIds text, hasImage integer)').run()

try {
    db.prepare('ALTER TABLE library ADD COLUMN disc').run()
} catch(err) {
    //
}

export default {
    addToLibrary(songs) {
        let existingSongs = this.getLibrary()
        let insert = db.prepare(`INSERT INTO library (title, artist, album, duration, path, id, hasImage, trackNum, year, disc) VALUES (@title, @artist, @album, @duration, @path, @id, @hasImage, @trackNum, @year, @disc)`)
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
        //console.log(id)
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
    getSomeFromColumnMatches(ids) {
        let prepIds = '';
        ids.forEach(id => {
            prepIds += `'${id}',`
        })
        prepIds = prepIds.substr(0, prepIds.length - 1)
        console.log(prepIds)
        let stmt = db.prepare(`SELECT * FROM library WHERE id IN (${prepIds})`)
        const rows = stmt.all()
        return rows
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
    deleteSome(ids) {
        let deleteId = db.prepare('DELETE FROM library WHERE id = ?')
        let deleteMany = db.transaction(songDelete => {
            songDelete.forEach(id => {
                deleteId.run(id)
            })
        })
        deleteMany(ids)
    },
    createPlaylist(playlist) {
        if (playlist.buffer) {
            files.savePlaylistImage(playlist.buffer, playlist.id)
            const pl = db.prepare(`INSERT INTO playlists (name, desc, id, songIds, hasImage) VALUES (@name, @desc, @id, @songIds, 1)`).run(playlist)
            return pl
        } else {
            const pl = db.prepare(`INSERT INTO playlists (name, desc, id, songIds, hasImage) VALUES (@name, @desc, @id, @songIds, 0)`).run(playlist)
            return pl
        }
    },
    getAllPlaylists() {
        return db.prepare('SELECT name,id FROM playlists').all()
    },
    getSpecificPlaylist(id) {
        return db.prepare('SELECT * FROM playlists WHERE id = ?').all(id)
    },
    updatePlaylist(column, id, data) {
        console.log(column, id, data)
        db.prepare(`UPDATE playlists SET ${column} = ? WHERE id = ?;`).run(data, id)
        return this.getAllPlaylists()
    },
    deletePlaylist(id) {
        db.prepare('DELETE FROM playlists WHERE id = ?').run(id)
        return this.getAllPlaylists()
    }
}