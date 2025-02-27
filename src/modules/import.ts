import {promises as fs, statSync, writeFile} from "fs";
import {resolve} from "path";
import mime from 'mime';
import {app, BrowserWindow} from "electron";
import FiretailSong from "../types/FiretailSong";
import {timeFormat} from "./timeformat";
// eslint-disable-next-line import/no-unresolved
import {IAudioMetadata} from 'music-metadata';
// eslint-disable-next-line import/no-unresolved

function randomString(length:number) {
    let text = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return text;
}

async function getFiles(dir:string) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files:(string | string[]) = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return files.flat();
}

export async function processFiles(files:string[]) {
    let processFiles:Array<string[]> = []
    for (const index in files) {
        const file = files[index];
        console.log(files)
        const stat = statSync(file);
        if (stat.isDirectory()) {
            const dirFiles = await getFiles(file);
            processFiles = processFiles.concat(await this.processFiles(dirFiles));
        } else {
            const fileName = resolve(file).split('/');
            const ext = fileName[fileName.length - 1].split('.').pop();
            const isAudio = mime.getType(ext);
            if (isAudio && isAudio.startsWith('audio')) {
                processFiles.push([file, fileName[fileName.length - 1]]);
            }
        }
    }
    return processFiles;
}

export async function addFiles(songs:Array<string[]>) {
    const path = app.getPath('userData');
    const getData:Promise<FiretailSong[]> = new Promise(resolve => {
        const toAdd:FiretailSong[] = [];
        const imgUsed:string[] = [];
        let progress = 0;
        songs.forEach(async f => {
            const id =  randomString(10)
            // we have to do this because of dumb cjs/esm stuff
            // eslint-disable-next-line import/no-unresolved
            const musicMetadata = await import('music-metadata');
            const meta:IAudioMetadata | void = await musicMetadata.parseFile(f[0]).catch(err => {
                console.log(err);
            })
            if (!meta) return;
            let explicit:number = null
            if (meta.native.iTunes) {
                const result = meta.native.iTunes.find(tag => tag.id == 'rtng');
                if (result) {
                    explicit = result.value
                }
            }
            const metaObj:FiretailSong = {
                title: meta.common.title ? meta.common.title : f[1],
                artist: meta.common.artist ? meta.common.artist : 'Unknown Artist',
                allArtists: meta.common.artists ? JSON.stringify(meta.common.artists) : null,
                albumArtist: meta.common.albumartist ? meta.common.albumartist : meta.common.artist ? meta.common.artist : 'Unknown Artist',
                album: meta.common.album ? meta.common.album : 'Unknown Album',
                duration: meta.format.duration ? timeFormat(meta.format.duration) : '0',
                realdur: meta.format.duration ? meta.format.duration : 0,
                path: f[0],
                id: id,
                hasImage: meta.common.picture ? 1 : 0,
                trackNum: meta.common.track.no ? meta.common.track.no : null,
                year: meta.common.year ? `${meta.common.year}` : null,
                disc: meta.common.disk ? meta.common.disk.no : null,
                explicit,
                genre: meta.common.genre ? JSON.stringify(meta.common.genre) : null
            }
            const artistAlbum = `${metaObj.albumArtist}${meta.common.album}`.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> {}[\]\\/]/gi, '')
            toAdd.push(metaObj)
            progress++
            BrowserWindow.getAllWindows()[0].webContents.send('doneProgress', [progress, songs.length])
            if (toAdd.length == songs.length) {
                BrowserWindow.getAllWindows()[0].webContents.send('startOrFinish', false)
                resolve(toAdd)
            }
            if (meta.common.picture && imgUsed.indexOf(artistAlbum) == -1) {
                imgUsed.push(artistAlbum)
                const pic = meta.common.picture[0]
                writeFile(`${path}/images/${artistAlbum}.jpg`, pic.data, err => {
                    if (err) console.log(err)
                })
            }
        })
    })
    return await getData
}