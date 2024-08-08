import DatabaseConstructor, {Database} from 'better-sqlite3';
import {app, ipcMain} from 'electron';

class FiretailDB {
  db: Database;

  constructor() {
    this.db = new DatabaseConstructor(`${app.getPath('userData')}/library.db`);
    this.db.pragma('journal_mode = WAL');
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

  startDBIpc() {
    ipcMain.handle('getAllSongs', () => {
      return this.getAllSongs();
    });

    ipcMain.handle('getAllAlbums', () => {
      return this.getAllAlbums();
    });

    ipcMain.handle('getAllFromMatchingColumn', (event, args) => {
      return this.getAllFromMatchingColumn(args[0], args[1]);
    });

    ipcMain.handle('getAllFromAlbum', (event, args) => {
      return this.getAllFromAlbum(args[0], args[1]);
    })
  }
}

export default FiretailDB;