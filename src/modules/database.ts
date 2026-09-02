import DatabaseConstructor, {Database} from 'better-sqlite3';
import {app, ipcMain} from 'electron';
import FiretailSong from "../types/FiretailSong";
import {addFiles, processFiles} from "./import";
import {mainWindow} from "../main";
import {Albums, AlbumsDB} from "../types/Albums";

interface Sum {
  sum: number;
}

interface Amount {
  amount: number;
}

class FiretailDB {
  db: Database;
  targetVersion = 1;

  constructor() {
    this.db = new DatabaseConstructor(`${app.getPath('userData')}/${app.isPackaged ? 'library' : 'library-dev'}.db`);
    this.db.pragma('journal_mode = WAL');
    const tableCount:number = this.determineNumber(this.db.prepare("SELECT COUNT(*) AS amount FROM sqlite_schema WHERE type='table'").pluck().get() as Amount);
    const userVersion:number = this.determineNumber(this.db.pragma("user_version", {simple: true}));
    this.setupNewDatabase();
    if (tableCount <= 0) {
      this.setupNewDatabase();
    } else if (userVersion < this.targetVersion) {
      this.upgradeDatabase(userVersion);
    } else if (userVersion > this.targetVersion) {
      //TODO: handle unexpected newer database versions
    }
    this.startDBIpc();
    this.determineAlbums();
  }

  getAllSongs() {
    const rows = this.db.prepare("SELECT * FROM library ORDER BY albumArtist COLLATE NOCASE,album COLLATE NOCASE,disc COLLATE NOCASE,trackNum COLLATE NOCASE").all();
    if (rows.length === 0) return {songs: rows, sum: 0}
    const sum:number = this.determineNumber(this.db.prepare("SELECT SUM(realdur) AS sum FROM library").pluck().get() as Sum);
    return {songs: rows, sum};
  }

  getAllAlbums() {
    const albumTypes:Map<string, AlbumsDB[]> = new Map();
    ["album", "ep", "single"].forEach((albumType) => {
      const getAlbums = this.db.prepare("SELECT * FROM albums WHERE albumType = ? ORDER BY title COLLATE NOCASE").all(albumType) as AlbumsDB[];
      albumTypes.set(albumType, getAlbums);
    });
    return albumTypes;
  }

  getAllArtists() {
    return (this.db.prepare("SELECT DISTINCT artist FROM library ORDER BY artist ASC").all() as { artist: string }[]).map(x => x.artist);
  }

  getAllFromMatchingColumn(column: string, value: string) {
    return this.db.prepare("SELECT * FROM library WHERE ? = ?").all(column, value);
  }

  getAllFromAlbum(album: string, albumArtist: string) {
    const songs = this.db.prepare("SELECT * FROM library WHERE album = ? AND albumArtist = ? ORDER BY disc,trackNum").all(album, albumArtist);
    const genres = this.db.prepare("SELECT DISTINCT g.value AS genre FROM library, json_each(genre) g WHERE genre IS NOT NULL AND genre IS NOT '' AND library.album = ? AND library.albumArtist = ?").all(album, albumArtist);
    const artists = this.db.prepare("SELECT DISTINCT a.value AS artist FROM library, json_each(allArtists) a WHERE allArtists IS NOT NULL AND allArtists IS NOT '' AND album = ? AND albumArtist = ?").all(album, albumArtist);
    if (songs.length === 0) return { songs, genres, artists, sum: 0 };
    const sum:number = this.determineNumber(this.db.prepare("SELECT SUM(realdur) AS sum FROM library WHERE album = ? AND albumArtist = ? ORDER BY disc,trackNum").pluck().get(album, albumArtist) as Sum);
    return { songs, genres, artists, sum };
  }

  getAllFromArtist(artist: string) {
    const songs = this.db.prepare("SELECT * FROM library WHERE artist = ? ORDER BY album,disc,trackNum").all(artist);
    const genres = this.db.prepare("SELECT DISTINCT g.value AS genre FROM library, json_each(genre) g WHERE genre IS NOT NULL AND genre IS NOT '' AND library.artist = ?").all(artist);
    if (songs.length === 0) return { songs, genres, sum: 0 };
    const sum:number = this.determineNumber(this.db.prepare("SELECT SUM(realdur) AS sum FROM library WHERE artist = ?").pluck().get(artist));
    return { songs, genres, sum };
  }

  addToLibrary(songs:FiretailSong[]) {
    const existingSongs:FiretailSong[] = this.getAllSongs().songs as FiretailSong[];
    const insert = this.db.prepare(`INSERT INTO library (title, artist, allArtists, albumArtist, album, duration, realdur, path, id, hasImage, trackNum, year, disc, explicit, genre) VALUES (@title, @artist, @allArtists, @albumArtist, @album, @duration, @realdur, @path, @id, @hasImage, @trackNum, @year, @disc, @explicit, @genre)`);
    const insertMany = this.db.transaction((newSongs: FiretailSong[]) => {
      for (const song of newSongs) {
        if (existingSongs.map(e => { return e.path }).indexOf(song.path) === -1) {
          insert.run(song);
        }
      }
    })
    insertMany(songs);
    this.determineAlbums();
  }

  determineAlbums() {
    const getAllAlbums = this.db.prepare("SELECT album, albumArtist, SUM(realdur) AS dur, COUNT(*) AS amount FROM library GROUP BY album, albumArtist").all() as Albums[];
    const insert = this.db.prepare("INSERT OR IGNORE INTO albums (title, albumArtist, albumType) VALUES (@title, @albumArtist, @albumType)");
    this.db.transaction((newAlbums: Albums[]) => {
      for (const album of newAlbums) {
        let albumType = 'album';
        if ((album.amount >= 1 && album.amount <= 3) || (album.dur < 600 && album.amount <= 6)) albumType = 'single';
        else if (album.amount <= 6 && album.dur < 1800) albumType = 'ep';
        insert.run({
          title: album.album,
          albumArtist: album.albumArtist,
          albumType
        })
      }
    })(getAllAlbums);
  }

  getAllPlaylists() {
    return this.db.prepare("SELECT * FROM playlists GROUP BY createdAt").all();
  }

  startDBIpc() {
    ipcMain.on('getAllSongs', (event) => {
      event.returnValue = this.getAllSongs();
    });

    ipcMain.on('getAllAlbums', (event) => {
      event.returnValue = this.getAllAlbums();
    });

    ipcMain.on('getAllArtists', (event) => {
      event.returnValue = this.getAllArtists();
    });

    ipcMain.on('getAllFromMatchingColumn', (event, args) => {
      event.returnValue = this.getAllFromMatchingColumn(args[0], args[1]);
    });

    ipcMain.on('getAllFromAlbum', (event, args) => {
      event.returnValue = this.getAllFromAlbum(args[0], args[1]);
    });

    ipcMain.on('getAllFromArtist', (event, args) => {
      event.returnValue = this.getAllFromArtist(args);
    });

    ipcMain.on('addToLibrary', async (event, locations:string[]) => {
      if (locations.length <= 0) return;
      const finalPaths = await processFiles(locations);
      const performAddFiles:FiretailSong[] = await addFiles(finalPaths.processFilesAr, finalPaths.coverImagePaths);
      this.addToLibrary(performAddFiles);
      mainWindow.webContents.send('refreshView');
    });

    ipcMain.on('getAllPlaylists', (event) => {
      event.returnValue = this.getAllPlaylists();
    });
  }

  setupNewDatabase() {
    this.db.pragma('foreign_keys = ON');

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS library (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT,
        allArtists TEXT,
        albumArtist TEXT,
        album TEXT,
        duration TEXT,
        realdur REAL,
        path TEXT NOT NULL,
        hasImage INTEGER NOT NULL DEFAULT 0 CHECK (hasImage IN (0,1)),
        trackNum INTEGER,
        year TEXT,
        disc INTEGER,
        explicit INTEGER NOT NULL DEFAULT 0 CHECK (explicit IN (0,1)),
        genre TEXT
      ) STRICT
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        albumArtist TEXT,
        albumType TEXT,
        UNIQUE(title, albumArtist)
      ) STRICT
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS favourites (
        songId TEXT PRIMARY KEY REFERENCES library(id) ON DELETE CASCADE,
        addedAt INTEGER NOT NULL DEFAULT (unixepoch())
      ) STRICT
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        imagePath TEXT,
        createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
        updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
      ) STRICT
    `).run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS playlistSongs (
        playlistId INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        songId TEXT NOT NULL REFERENCES library(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        PRIMARY KEY (playlistId, songId)
      ) STRICT
    `).run();

    this.db.prepare('CREATE INDEX IF NOT EXISTS indexPlaylistSongsOrder ON playlistSongs(playlistId, position)').run();
    this.db.prepare('CREATE INDEX IF NOT EXISTS indexLibraryAlbum ON library(album, albumArtist)').run();
    this.db.prepare('CREATE INDEX IF NOT EXISTS indexLibraryArtist ON library(artist)').run();

    this.db.prepare(`
      CREATE TABLE IF NOT EXISTS stats (
        songId TEXT PRIMARY KEY REFERENCES library(id) ON DELETE CASCADE,
        plays INTEGER NOT NULL DEFAULT 0,
        lastplay INTEGER
      ) STRICT
    `).run();

    this.db.pragma(`user_version=${this.targetVersion}`);
  }

  upgradeDatabase(userVersion: number) {
    console.log(`Provided database version ${userVersion}. Upgrading to version ${this.targetVersion}...`);
    switch(userVersion) {
      case 0: {
        //TODO: Add upgrade to new playlist system
        this.db.prepare('CREATE TABLE IF NOT EXISTS albums (title text, albumArtist text, albumType text, UNIQUE(title, albumArtist))').run()
      }
    }
    this.db.pragma(`user_version=${this.targetVersion}`);
    console.log(`Database upgrade successful.`);
  }

  determineNumber(data: unknown) {
    if (data === null) throw 'No data was provided.';
    if (typeof data === "number") return Number(data);
    else throw `Data provided is not a number. Provided type: ${typeof data}`;
  }
}

export default FiretailDB;