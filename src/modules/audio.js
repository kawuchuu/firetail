/*
   This new audio module will be implemented after Firetail 1.0 is released
   due to the complexity of replacing the current audio system.
*/

import store from '../store/index.js'
import {bus} from '../renderer.js'

class AudioPlayer {
    audio = new Audio()
    _currentTime = 0
    duration = 0
    volume = 1
    muted = false
    _queue = []
    _index = 0
    _currentSong = null
    _paused = true
    stopped = true
    updateLocal = 0
    playbackRate = 1

    constructor() {
        this.audio.addEventListener('timeupdate', (evt) => { this.timeUpdate(evt) })
        this.audio.addEventListener('ended', () => { this.ended() })
        this.audio.addEventListener('pause', () => {
            store.commit('audio/updatePause', true)
        })
        this.audio.addEventListener('play', () => {
            store.commit('audio/updatePause', false)
        })
        this.metadata = new Metadata(this)
    }

    get currentTime() {
        return this._currentTime
    }

    set currentTime(time) {
        this.audio.currentTime = time
        this._currentTime = time
    }

    get paused() {
        return this._paused
    }

    get queue() {
        return this._queue
    }

    get index() {
        return this._index
    }

    set queue(songs) {
        this._queue = songs
    }

    get currentSong() {
        return this._currentSong
    }

    set currentSong(id) {
        this._currentSong = id
        store.commit('audio/updateCurrentSongStringPlain', id)
    }

    set index(id) {
        this._index = id
        console.log(this.index)
        store.commit('audio/updateCurrentSongIndexPlain', id)
    }

    async playSong(song) {
        if (!song.path) return
        this.audio.src = `local-resource://${song.path}`
        //console.log(this.audio.currentTime)
        this.currentSong = song.id
        store.commit('audio/updatePause', false)
        this.metadata.setSongMetadata(song)
        await this.audio.play().catch(err => {
            let msg = err.toString()
            if (err.toString().includes('supported source was found')) {
                msg = 'The file you requested could not be played. Make sure the file exists and try again.'
            }
            bus.$emit('notifySwag', {
                title: "Unfortunately, an error occurred",
                message: msg,
                icon: "error"
            })
        })
        window.localStorage.setItem('lastPlayed', JSON.stringify({
            song: song,
            view: store.state.nav.playingView,
            songIndex: this._index
        }))
        window.localStorage.setItem('lastPlayTime', 0.1)
    }

    togglePlay() {
        if (this.audio.paused) this.audio.play()
        else this.audio.pause()
        return this.audio.paused
    }

    nextSong() {
        this.index++
        console.log('NEXT SONG ' + this.index)
        this.currentSong = this._queue[this.index]
        this.playSong(this.currentSong)
    }

    prevSong() {
        if (this._currentTime > 5) {
            this._currentTime = 0
        } else {
            this.index--
            this.currentSong = this._queue[this.index]
            this.playSong(this.currentSong)
        }
    }

    timeUpdate(evt) {
        if (this.updateLocal === 10) {
            window.localStorage.setItem('lastPlayTime', this._currentTime)
            this.updateLocal = 0
        } else {
            this.updateLocal++
        }
        this._currentTime = this.audio.currentTime
        this.duration = this.audio.duration
        store.commit('audio/timeUpdate', [this.duration, this._currentTime])
    }

    ended() {
        this.nextSong()
    }
}

class Metadata {
    title = null
    artist = null
    album = null
    path = null

    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer
    }

    setSongMetadata(song) {
        store.commit('audio/songMetadata', [song.title, song.artist])
        this.updateMediaSession(song)
    }

    updateMediaSession(song) {
        let metadata = {
            title: song.title,
            artist: song.artist,
            album: song.album,
            src: song.path
        }
        if (song.hasImage === 1) {
            let port = store.state.nav.port
            let artistAlbum = ''
            if (song.id === 'customSong') {
                artistAlbum = song.customImage
            } else {
                artistAlbum = `http://localhost:${port}/images/${(song.artist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
            }
            metadata['artwork'] = [{src: artistAlbum, sizes: '512x512', type: 'image/jpeg'}]
        }
        navigator.mediaSession.metadata = new window.MediaMetadata(metadata)
        navigator.mediaSession.setActionHandler('previoustrack', this.prevSong)
        navigator.mediaSession.setActionHandler('nexttrack', this.nextSong)
        try {
            navigator.mediaSession.setPositionState({
                duration: this.audioPlayer.duration,
                playbackRate: this.audioPlayer.playbackRate,
                position: this.audioPlayer.currentTime
            });
        } catch {}
    }
}

export default AudioPlayer