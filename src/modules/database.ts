import DatabaseConstructor, {Database} from 'better-sqlite3';
import {app, ipcMain} from 'electron';
import FiretailSong from "../types/FiretailSong";
import {addFiles, processFiles} from "./import";
import {mainWindow} from "../main";

class FiretailDB {
  db: Database;

  constructor() {
    this.db = new DatabaseConstructor(`${app.getPath('userData')}/${app.isPackaged ? 'library' : 'library-dev'}.db`);
    this.db.pragma('journal_mode = WAL');
    const tableCount:any = this.db.prepare("SELECT COUNT(*) AS amount FROM sqlite_master WHERE type='table'").all();
    if (tableCount[0].amount <= 0) {
      this.setupNewDatabase();
    }
    this.startDBIpc();
  }

  getAllSongs() {
    const rows = this.db.prepare("SELECT * FROM library ORDER BY albumArtist COLLATE NOCASE,album COLLATE NOCASE,trackNum COLLATE NOCASE").all();
    const sum:any = this.db.prepare("SELECT SUM(realdur) AS sum FROM library").all();
    return {songs: rows, sum: sum[0].sum};
  }

  getAllAlbums() {
    const rows = this.db.prepare("SELECT DISTINCT albumArtist,album FROM library ORDER BY album COLLATE NOCASE").all();
    return rows;
  }

  getAllFromMatchingColumn(column: string, value: string) {
    const rows = this.db.prepare("SELECT * FROM library WHERE ? = ?").all(column, value);
    return rows;
  }

  getAllFromAlbum(album: string, albumArtist: string) {
    const songs = this.db.prepare("SELECT * FROM library WHERE album = ? AND albumArtist = ? ORDER BY disc,trackNum").all(album, albumArtist);
    const genres = this.db.prepare("SELECT DISTINCT g.value AS genre FROM library, json_each(genre) g WHERE genre IS NOT NULL AND genre IS NOT '' AND library.album = ? AND library.albumArtist = ?").all(album, albumArtist);
    const artists = this.db.prepare("SELECT DISTINCT a.value AS artist FROM library, json_each(allArtists) a WHERE allArtists IS NOT NULL AND allArtists IS NOT '' AND album = ? AND albumArtist = ?").all(album, albumArtist);
    const sum:any = this.db.prepare("SELECT SUM(realdur) AS sum FROM library WHERE album = ? AND albumArtist = ? ORDER BY disc,trackNum").all(album, albumArtist);
    return { songs, genres, artists, sum: sum[0].sum };
  }

  addToLibrary(songs:FiretailSong[]) {
    const existingSongs:FiretailSong[] = this.getAllSongs().songs;
    const insert = this.db.prepare(`INSERT INTO library (title, artist, allArtists, albumArtist, album, duration, realdur, path, id, hasImage, trackNum, year, disc, explicit, genre) VALUES (@title, @artist, @allArtists, @albumArtist, @album, @duration, @realdur, @path, @id, @hasImage, @trackNum, @year, @disc, @explicit, @genre)`);
    const insertMany = this.db.transaction((newSongs: FiretailSong[]) => {
      for (const song of newSongs) {
        if (existingSongs.map(e => { return e.path }).indexOf(song.path) === -1) {
          insert.run(song);
        }
      }
    })
    insertMany(songs);
  }

  startDBIpc() {
    ipcMain.on('getAllSongs', (event) => {
      event.returnValue = this.getAllSongs();
    });

    ipcMain.on('getAllAlbums', (event) => {
      event.returnValue = this.getAllAlbums();
    });

    ipcMain.on('getAllFromMatchingColumn', (event, args) => {
      event.returnValue = this.getAllFromMatchingColumn(args[0], args[1]);
    });

    ipcMain.on('getAllFromAlbum', (event, args) => {
      event.returnValue = this.getAllFromAlbum(args[0], args[1]);
    });

    ipcMain.on('addToLibrary', async (event, locations:string[]) => {
      if (locations.length <= 0) return;
      const finalPaths = await processFiles(locations);
      const performAddFiles:FiretailSong[] = await addFiles(finalPaths);
      this.addToLibrary(performAddFiles);
      mainWindow.webContents.send('refreshView');
    });
  }

  setupNewDatabase() {
    this.db.prepare('CREATE TABLE IF NOT EXISTS library (title text, artist text, allArtists text, albumArtist text, album text, duration text, realdur number, path text, id text, hasImage number, trackNum number, year text, disc number, explicit number, genre text)').run()
    this.db.prepare('CREATE TABLE IF NOT EXISTS albums (title text, albumArtist text, albumType text)')
    this.db.prepare('CREATE TABLE IF NOT EXISTS favourites (id text)').run()
    this.db.prepare('CREATE TABLE IF NOT EXISTS playlists (name text, desc text, id text, songIds text, hasImage number)').run()
    this.db.prepare('CREATE TABLE IF NOT EXISTS stats (id text, plays number, lastplay number)').run()
  }
}

export default FiretailDB;