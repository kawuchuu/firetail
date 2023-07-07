import Database from 'better-sqlite3'
import {app} from 'electron'
import files from './files'

const db = new Database(`${app.getPath('userData')}/library.db`, {  })
db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, album text, duration text, realdur number, path text, id text, hasImage number, trackNum number, year text, disc number, explicit number)').run()
db.prepare('CREATE TABLE IF NOT EXISTS favourites (id text)').run()
db.prepare('CREATE TABLE IF NOT EXISTS playlists (name text, desc text, id text, songIds text, hasImage number)').run()

export default {
    addToLibrary(songs) {
        let existingSongs = this.getLibrary()
        let insert = db.prepare(`INSERT INTO library (title, artist, album, duration, realdur, path, id, hasImage, trackNum, year, disc, explicit) VALUES (@title, @artist, @album, @duration, @realdur, @path, @id, @hasImage, @trackNum, @year, @disc, @explicit)`)
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
        let durSum = db.prepare('SELECT SUM(realdur) FROM library').all()
        return [rows, durSum[0]['SUM(realdur)']]
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
            const durSum = db.prepare(`SELECT SUM(realdur) FROM library WHERE ${column} = ?`).all(query)
            return [rows, durSum[0]['SUM(realdur)']]
        } else return [[], 0]
    },
    getSomeFromColumnMatches(ids) {
        let prepIds = '';
        ids.forEach(id => {
            prepIds += `'${id}',`
        })
        prepIds = prepIds.substr(0, prepIds.length - 1)
        let stmt = db.prepare(`SELECT * FROM library WHERE id IN (${prepIds})`)
        const rows = stmt.all()
        const durSum = db.prepare(`SELECT SUM(realdur) FROM library WHERE id IN (${prepIds})`).all()
        return [rows, durSum[0]['SUM(realdur)']]
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
    doFullQuery(query) {
        const songsResult = db.prepare(`SELECT DISTINCT * FROM library WHERE title LIKE '%'||?||'%' GROUP BY title ORDER BY title = ? ASC, title LIKE ?||'%' DESC LIMIT 5`).all(query, query, query)
        const artistsResult = db.prepare(`SELECT DISTINCT artist,id FROM library WHERE artist LIKE '%'||?||'%' GROUP BY artist ORDER BY artist = ? ASC, artist LIKE ?||'%' DESC LIMIT 5`).all(query, query, query)
        const albumResult = db.prepare(`SELECT album,artist,hasImage,id FROM library WHERE album LIKE '%'||?||'%' GROUP BY album ORDER BY album = ? ASC, album LIKE ?||'%' DESC LIMIT 5`).all(query, query, query)
        return {
            songs: songsResult,
            artists: artistsResult,
            albums: albumResult,
            playlists: []
        }
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
        return db.prepare('SELECT name,id,hasImage FROM playlists').all()
    },
    getSpecificPlaylist(id) {
        return db.prepare('SELECT * FROM playlists WHERE id = ?').all(id)
    },
    updatePlaylist(column, id, data) {
        db.prepare(`UPDATE playlists SET ${column} = ? WHERE id = ?;`).run(data, id)
        return this.getAllPlaylists()
    },
    deletePlaylist(id) {
        db.prepare('DELETE FROM playlists WHERE id = ?').run(id)
        return this.getAllPlaylists()
    },
    getAllFavouriteSongs() {
        const allFavourites = this.getAllFavouriteSongs()
        console.log('doing it?')
        return db.prepare('SELECT * FROM library WHERE id = ?').run(allFavourites)
    }
}