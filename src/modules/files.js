import * as metadata from 'music-metadata'
import time from '../modules/timeformat'

let randomString = length => {
    let text = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return text
}

export default {
    async addFiles(songs) {
        let getData = new Promise(resolve => {
            let toAdd = []
            songs.forEach(async f => {
                let meta = await metadata.parseFile(f[0])
                let metaObj = {
                    title: f[1],
                    artist: 'Unknown Artist',
                    album: 'Unknown Album',
                    duration: 0,
                    path: f[0],
                    id: randomString(10)
                }
                if (meta.common.title) metaObj['title'] = meta.common.title
                if (meta.common.artist) metaObj['artist'] = meta.common.artist
                if (meta.common.album) metaObj['album'] = meta.common.album
                if (meta.format.duration) metaObj['duration'] = time.timeFormat(meta.format.duration)
                toAdd.push(metaObj)
                if (toAdd.length == songs.length) {
                    resolve(toAdd)
                }
            })
        })
        return await getData
    }
}