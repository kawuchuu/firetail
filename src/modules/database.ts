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
    const rows = this.db.prepare("SELECT * FROM library").all();
    return rows;
  }

  getAllAlbums() {
    const rows = this.db.prepare("SELECT DISTINCT albumArtist,album FROM library").all();
    return rows;
  }

  getAllFromMatchingColumn(column: string, value: string) {
    const rows = this.db.prepare("SELECT * FROM library WHERE ? = ?").all(column, value);
    return rows;
  }

  getAllFromAlbum(album: string, albumArtist: string) {
    return this.db.prepare("SELECT * FROM library WHERE album = ? AND albumArtist = ?").all(album, albumArtist);
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