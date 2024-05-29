import Database from 'better-sqlite3'
import {app} from 'electron'
import files from './files'

const db = new Database(`${app.getPath('userData')}/library.db`, {  })
db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, allArtists text, albumArtist text, album text, duration text, realdur number, path text, id text, hasImage number, trackNum number, year text, disc number, explicit number, genre text)').run()
db.prepare('CREATE TABLE IF NOT EXISTS favourites (id text)').run()
db.prepare('CREATE TABLE IF NOT EXISTS playlists (name text, desc text, id text, songIds text, hasImage number)').run()
db.prepare('CREATE TABLE IF NOT EXISTS stats (id text, plays number, lastplay number)').run()

export default {
    addToLibrary(songs) {
        let existingSongs = this.getLibrary()[0]
        let insert = db.prepare(`INSERT INTO library (title, artist, allArtists, albumArtist, album, duration, realdur, path, id, hasImage, trackNum, year, disc, explicit, genre) VALUES (@title, @artist, @allArtists, @albumArtist, @album, @duration, @realdur, @path, @id, @hasImage, @trackNum, @year, @disc, @explicit, @genre)`)
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
        if (column == 'artist') {
            let rows = db.prepare(`SELECT DISTINCT artist FROM library`).all()
            return [column, rows]
        } else if (column == 'album') {
            let rows = db.prepare(`SELECT DISTINCT albumArtist,album FROM library`).all()
            return [column, rows]
        } else return []
    },
    getAllFromColumnWithArtist() {
        let rows = db.prepare(`SELECT DISTINCT albumArtist,album,hasImage FROM library`).all();
        return rows
    },
    getSomeFromColumn(column, query) {
        if (column[0] == 'artist') {
            let rows = db.prepare(`SELECT * FROM library WHERE artist = ?`).all(query)
            const durSum = db.prepare(`SELECT SUM(realdur) FROM library WHERE artist = ?`).all(query)
            return [rows, durSum[0]['SUM(realdur)']]
        } else if (column[0] == 'album') {
            let rows = db.prepare(`SELECT * FROM library WHERE album = ? AND albumArtist = ?`).all(query, column[1])
            const durSum = db.prepare(`SELECT SUM(realdur) FROM library WHERE album = ? AND albumArtist = ?`).all(query, column[1])
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
        const albumResult = db.prepare(`SELECT album,albumArtist,hasImage,id FROM library WHERE album LIKE '%'||?||'%' GROUP BY album ORDER BY album = ? ASC, album LIKE ?||'%' DESC LIMIT 5`).all(query, query, query)
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
        const allFavourites = this.getFavourites()
        if (!allFavourites || allFavourites.length == 0) return [[], 0]
        const getSongs = db.prepare('SELECT * FROM library INNER JOIN favourites ON library.id = favourites.id').all()
        const durSum = db.prepare(`SELECT SUM(realdur) FROM library INNER JOIN favourites ON library.id = favourites.id`).all()
        return [getSongs, durSum[0]['SUM(realdur)']]
    },
    addStatPlay(id) {
        const findStatPlay = db.prepare('SELECT * FROM stats WHERE id = ?').all(id)
        if (findStatPlay.length === 0) {
            db.prepare('INSERT INTO stats (id, plays, lastplay) VALUES (?, ?, ?)').run(id, 1, Date.now())
        } else {
            db.prepare('UPDATE stats SET plays = ?, lastplay = ? WHERE id = ?').run(findStatPlay[0].plays + 1, Date.now(), id)
        }
    },
    getMostPlayed() {
        return db.prepare("SELECT * FROM library INNER JOIN stats ON library.id = stats.id ORDER BY stats.plays DESC LIMIT 10").all()
    },
    getRecentlyPlayed() {
        return db.prepare("SELECT * FROM library INNER JOIN stats ON library.id = stats.id ORDER BY stats.lastplay DESC LIMIT 10").all()
    },
    getGenres() {
        return db.prepare('SELECT DISTINCT g.value FROM library, json_each(genre) g WHERE genre IS NOT NULL').all()
    },
    getGenreResults(genre) {
        const getSongs = db.prepare('SELECT library.* FROM library, json_each(genre) genre WHERE genre IS NOT NULL AND genre.value = ?').all(genre)
        const durSum = db.prepare('SELECT SUM(library.realdur) AS dur FROM library, json_each(genre) genre WHERE genre IS NOT NULL AND genre.value = ?').all(genre)
        return [getSongs, durSum[0].dur]
    }
}