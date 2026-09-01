import {promises as fs, existsSync} from "fs";
import {resolve, dirname} from "path";
import {mime} from "../main";
import {app, BrowserWindow} from "electron";
import FiretailSong from "../types/FiretailSong";
import {timeFormat} from "./timeformat";
// eslint-disable-next-line import/no-unresolved
import {IAudioMetadata} from 'music-metadata';

function randomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({length}, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
}

async function getFiles(dir: string): Promise<string[]> {
    const dirents = await fs.readdir(dir, {withFileTypes: true});
    const files = await Promise.all(dirents.map(dirent => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return files.flat();
}

function resolveCoverPath(dir: string): string | null {
    for (const name of ['cover.jpg', 'cover.png']) {
        const p = resolve(dir, name);
        if (existsSync(p)) return p;
    }
    return null;
}

export async function processFiles(files: string[]): Promise<{processFilesAr: string[][], coverImagePaths: string[]}> {
    let processFilesAr: string[][] = [];
    let coverImagePaths: string[] = [];
    for (const file of files) {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) {
            const dirFiles = await getFiles(file);
            const processing = await processFiles(dirFiles);
            processFilesAr = processFilesAr.concat(processing.processFilesAr);
            if (processing.processFilesAr.length > 0) {
                coverImagePaths = coverImagePaths.concat(processing.coverImagePaths);
            }
        } else {
            const parts = resolve(file).split('/');
            const filename = parts[parts.length - 1];
            const ext = filename.split('.').pop();
            const mimeType = mime.getType(ext);
            if (mimeType?.startsWith('audio')) {
                processFilesAr.push([file, filename]);
            }
            if ((mimeType === 'image/jpeg' || mimeType === 'image/png') && filename.startsWith('cover')) {
                coverImagePaths.push(dirname(resolve(file)));
            }
        }
    }
    return {processFilesAr, coverImagePaths};
}

export async function addFiles(songs: string[][], coverImagePaths: string[]): Promise<FiretailSong[]> {
    const path = app.getPath('userData');
    // eslint-disable-next-line import/no-unresolved
    const musicMetadata = await import('music-metadata');
    const imgUsed: string[] = [];
    let progress = 0;
    const toAdd = await Promise.all(songs.map(async f => {
        const id = randomString(10);
        const meta: IAudioMetadata | void = await musicMetadata.parseFile(f[0]).catch(err => {
            console.log(err);
        });
        if (!meta) return null;
        let explicit: number | null = 0;
        if (meta.native.iTunes) {
            const result = meta.native.iTunes.find(tag => tag.id === 'rtng');
            if (result) explicit = result.value;
        }
        const metaObj: FiretailSong = {
            title: meta.common.title ?? f[1],
            artist: meta.common.artist ?? 'Unknown Artist',
            allArtists: meta.common.artists ? JSON.stringify(meta.common.artists) : null,
            albumArtist: meta.common.albumartist ?? meta.common.artist ?? 'Unknown Artist',
            album: meta.common.album ?? null,
            duration: meta.format.duration ? timeFormat(meta.format.duration) : '0',
            realdur: meta.format.duration ?? 0,
            path: f[0],
            id,
            hasImage: 0,
            trackNum: meta.common.track.no ?? null,
            year: meta.common.year ? `${meta.common.year}` : null,
            disc: meta.common.disk ? meta.common.disk.no : null,
            explicit,
            genre: meta.common.genre ? JSON.stringify(meta.common.genre) : null
        }
        const artistAlbum = `${metaObj.albumArtist}${meta.common.album ?? meta.common.track}`.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> {}[\]\\/]/gi, '');
        const coverPath = resolveCoverPath(dirname(f[0]));
        const dirHasCover = coverPath !== null && coverImagePaths.includes(dirname(f[0]));
        if (dirHasCover || meta.common.picture) {
            metaObj.hasImage = 1;
        }
        BrowserWindow.getAllWindows()[0].webContents.send('doneProgress', [++progress, songs.length]);
        if (dirHasCover && !imgUsed.includes(artistAlbum)) {
            imgUsed.push(artistAlbum);
            await fs.copyFile(coverPath, `${path}/images/${artistAlbum}.jpg`);
        } else if (!dirHasCover && meta.common.picture && !imgUsed.includes(artistAlbum)) {
            imgUsed.push(artistAlbum);
            const pic = meta.common.picture[0];
            await fs.writeFile(`${path}/images/${artistAlbum}.jpg`, pic.data);
        }
        return metaObj;
    }));
    BrowserWindow.getAllWindows()[0].webContents.send('startOrFinish', false);
    return toAdd.filter((s): s is FiretailSong => s !== null);
}