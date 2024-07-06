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

  startDBIpc() {
    ipcMain.handle('getAllSongs', () => {
      return this.getAllSongs();
    });
  }
}

export default FiretailDB;