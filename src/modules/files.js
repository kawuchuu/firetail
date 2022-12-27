import * as metadata from 'music-metadata'
import time from '../modules/timeformat'
import { writeFile, statSync, readdirSync } from 'fs'
import { promises as fs, constants as fsConstants } from 'fs'
import { app, BrowserWindow } from 'electron'
import mime from 'mime-types'
import sharp from 'sharp'
import { resolve } from 'path'

let randomString = length => {
    let text = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return text
}

export default {
    async processFiles(filesAR) {
        let processFiles = []
        for (const item of filesAR) {
            const path = item[0]
            const name = item[1]
            const stat = statSync(path)
            if (stat) {
                if (stat.isDirectory()) {
                    const files = readdirSync(path)
                    for (const file of files) {
                        const fullPath = `${path}/${file.toString()}`
                        if (statSync(fullPath).isFile()) {
                            const ext = file.toString().split('.').pop()
                            const isAudio = mime.lookup(ext)
                            if (isAudio && isAudio.startsWith('audio')) {
                                processFiles.push([fullPath, file.toString()])
                            }
                        }
                    }
                } else if (stat.isFile()) {
                    const ext = name.split('.').pop()
                    const isAudio = mime.lookup(ext)
                    if (isAudio && isAudio.startsWith('audio')) {
                        processFiles.push([path, name])
                    }
                }
            }
        }
        const stuff = await this.addFiles(processFiles)
        return stuff
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
                let metaObj = {
                    title: meta.common.title ? meta.common.title : f[1],
                    artist: meta.common.artist ? meta.common.artist : 'Unknown Artist',
                    album: meta.common.album ? meta.common.album : 'Unknown Album',
                    duration: meta.format.duration ? time.timeFormat(meta.format.duration) : 0,
                    path: f[0],
                    id: id,
                    hasImage: meta.common.picture ? 1 : 0,
                    trackNum: meta.common.track.no ? meta.common.track.no : null,
                    year: meta.common.year ? meta.common.year : null,
                    disc: meta.common.disk ? meta.common.disk.no : null
                }
                console.log(meta.common.year)
                let artistAlbum = `${meta.common.artist}${meta.common.album}`.replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')
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