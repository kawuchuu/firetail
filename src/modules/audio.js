import store from '../store/index.js'

class AudioPlayer {
    audio = new Audio()
    currentTime = 0
    duration = 0
    volume = 1
    muted = false
    queue = []
    index = 0
    currentSong = null
    paused = this.audio.paused
    stopped = true
    updateLocal = 0
    constructor() {
        this.audio.addEventListener('timeupdate', () => { this.timeUpdate() })
    }

    set currentTime(time) {
        this.audio.currentTime = time
        this.currentTime = time
    }

    async playSong(song) {
        if (!song.path) return
        this.audio.src = `local-resource://${song.path}`
        console.log(this.audio.currentTime)
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
    }

    togglePlay() {
        if (this.audio.paused) this.audio.play()
        else this.audio.pause()
    }

    nextSong() {
        this.index++
        this.currentSong = this.queue[this.index]
        this.playSong(this.currentSong)
    }

    prevSong() {
        if (this.currentTime > 5) {
            this.currentTime = 0
        } else {
            this.index--
            this.currentSong = this.queue[this.index]
            this.playSong(this.currentSong)
        }
    }

    timeUpdate() {
        if (this.updateLocal === 10) {
            window.localStorage.setItem('lastPlayTime', this.audio.currentTime)
            this.updateLocal = 0
        } else {
            this.updateLocal++
        }
        this.currentTime = this.audio.currentTime
        this.duration = this.audio.duration
    }
}

class Metadata extends AudioPlayer {
    constructor() {
        super()
        this.title = null
        this.artist = null
        this.album = null
        this.path = null
    }

    updateMediaSession() {
        let metadata = {
            title: song.title,
            artist: song.artist,
            album: song.album,
            src: song.path
        }
        if (song.hasImage == 1) {
            let port = store.state.nav.port
            let artistAlbum = ''
            if (song.id == 'customSong') {
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
                duration: this.audio.duration,
                playbackRate: this.audio.playbackRate,
                position: this.audio.currentTime
            });
        } catch {} 
    }
}

export default AudioPlayer