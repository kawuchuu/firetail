import * as metadata from 'music-metadata'
import time from '../modules/timeformat'
import { writeFile, statSync, readdirSync } from 'fs'
import { promises as fs, constants as fsConstants } from 'fs'
import { app, BrowserWindow } from 'electron'
import mime from 'mime-types'
//import sharp from 'sharp'
import { resolve } from 'path'
import sharp from "sharp";

let randomString = length => {
    let text = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return text
}

const getFiles = async (dir) => {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return files.flat()
}

export default {
    async processFiles(files) {
        let processFiles = []
        for (const index in files) {
            const file = files[index]
            const stat = statSync(file)
            if (stat.isDirectory()) {
                const dirFiles = await getFiles(file)
                processFiles = processFiles.concat(await this.processFiles(dirFiles))
            } else {
                const fileName = resolve(file).split('/')
                const ext = fileName[fileName.length - 1].split('.').pop()
                const isAudio = mime.lookup(ext)
                if (isAudio && isAudio.startsWith('audio')) {
                    processFiles.push([file, fileName[fileName.length - 1]])
                }
            }
        }
        return processFiles
        /*const stuff = await this.addFiles(processFiles)
        return stuff*/
    },
    async addFiles(songs) {
        let path = app.getPath('userData')
        let getData = new Promise(resolve => {
            let toAdd = []
            let imgUsed = []
            let progress = 0;
            songs.forEach(async f => {
                let id =  randomString(10)
                let meta = await metadata.parseFile(f[0]).catch(err => {
                    console.log(err);
                })
                if (!meta) return;
                let explicit = null
                if (meta.native.iTunes) {
                    const result = meta.native.iTunes.find(tag => tag.id == 'rtng');
                    if (result) {
                        explicit = result.value
                    }
                }
                let metaObj = {
                    title: meta.common.title ? meta.common.title : f[1],
                    artist: meta.common.artist ? meta.common.artist : 'Unknown Artist',
                    allArtists: meta.common.artists ? JSON.stringify(meta.common.artists) : null,
                    albumArtist: meta.common.albumartist ? meta.common.albumartist : meta.common.artist ? meta.common.artist : 'Unknown Artist',
                    album: meta.common.album ? meta.common.album : 'Unknown Album',
                    duration: meta.format.duration ? time.timeFormat(meta.format.duration) : 0,
                    realdur: meta.format.duration ? meta.format.duration : 0,
                    path: f[0],
                    id: id,
                    hasImage: meta.common.picture ? 1 : 0,
                    trackNum: meta.common.track.no ? meta.common.track.no : null,
                    year: meta.common.year ? `${meta.common.year}` : null,
                    disc: meta.common.disk ? meta.common.disk.no : null,
                    explicit
                }
                let artistAlbum = `${metaObj.albumArtist}${meta.common.album}`.replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')
                toAdd.push(metaObj)
                progress++
                BrowserWindow.getAllWindows()[0].webContents.send('doneProgress', [progress, songs.length])
                if (toAdd.length == songs.length) {
                    BrowserWindow.getAllWindows()[0].webContents.send('startOrFinish', false)
                    resolve(toAdd)
                }
                if (meta.common.picture && imgUsed.indexOf(artistAlbum) == -1) {
                    imgUsed.push(artistAlbum)
                    let pic = meta.common.picture[0]
                    writeFile(`${path}/images/${artistAlbum}.jpg`, pic.data, err => {
                        if (err) console.log(err)
                    })
                }
            })
        })
        return await getData
    },
    async savePlaylistImage(buffer, id) {
        if (buffer) {
            const playlistImgPath = resolve(app.getPath('userData'), 'images/playlist')
            try {
                await fs.access(playlistImgPath, fsConstants.R_OK | fsConstants.W_OK)
            } catch(e) {
                await fs.mkdir(playlistImgPath)
            }
             sharp(Buffer.from(buffer))
                .toFormat('jpg')
                .resize({
                    width: 256,
                    height: 256,
                    fit: 'cover',
                    withoutEnlargement: true
                })
                .toFile(`${playlistImgPath}/${id}.jpg`)
                .catch(err => {
                    console.error(err)
                })
        }
    }
}