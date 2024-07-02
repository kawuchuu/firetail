import FiretailSong from "../types/FiretailSong";
import {reactive} from "vue";
import {audioPlayer} from "../renderer";

interface AudioStore {
    title: string;
    artist: string;
    currentTime: number;
    duration: number;
    currentSong: FiretailSong;
    paused: boolean;
}

class AudioPlayer {
    #audio = new Audio();
    #currentTime = 0;
    #duration = 0;
    volume = 1;
    muted = false;
    #queue:FiretailSong[] = [];
    #index = 0;
    #id:string;
    #currentSong: FiretailSong;
    #paused = true;
    stopped = true;
    updateLocal = 0;
    playbackRate = 1;
    metadata: Metadata;
    reactive: AudioStore;
    constructor() {
        this.#audio.addEventListener("ended", () => {
            this.nextSong();
        });
        this.#audio.addEventListener("timeupdate", this.timeUpdate);
        this.#audio.addEventListener("pause", () => {
            this.paused = true;
        });
        this.#audio.addEventListener("playing", () => {
            this.paused = false;
        })
        this.metadata = new Metadata(this);
        this.reactive = reactive({
            title: this.metadata.title,
            artist: this.metadata.artist,
            currentTime: this.currentTime,
            duration: this.duration,
            currentSong: this.currentSong,
            paused: this.paused
        });
    }

    get currentTime() {
        return this.#currentTime
    }

    set currentTime(time) {
        this.#currentTime = time
        this.reactive.currentTime = time;
    }

    setCurrentTime(time:number) {
        this.#audio.currentTime = time;
        this.currentTime = time;
    }

    get duration() {
        return this.#duration;
    }

    set duration(time) {
        this.#duration = time;
        this.reactive.duration = time;
    }

    get paused() {
        return this.#paused;
    }

    set paused(pause: boolean) {
        this.#paused = pause;
        this.reactive.paused = pause;
    }

    get queue() {
        return this.#queue
    }

    set queue(songs) {
        this.#queue = songs
    }

    get index() {
        return this.#index
    }

    set index(id) {
        this.#index = id
        console.log(this.index)
    }

    get currentSong() {
        return this.#currentSong;
    }

    set currentSong(song) {
        this.#currentSong = song;
        this.reactive.currentSong = song;
    }

    doTimeUpdate(willDo:boolean) {
        if (willDo) this.#audio.addEventListener('timeupdate', this.timeUpdate);
        else this.#audio.removeEventListener('timeupdate', this.timeUpdate);
    }

    async playSong(song: FiretailSong) {
        if (!song.path) return
        this.#audio.src = `local-resource://${song.path}`
        //console.log(this.audio.currentTime)
        this.#id = song.id;
        this.currentSong = song;
        this.duration = song.realdur;
        this.metadata.title = song.title;
        this.metadata.artist = song.artist;
        this.metadata.setSongMetadata(song)
        await this.#audio.play().catch(err => {
            console.error(err);
        })
    }

    enqueue(newQueue: FiretailSong[], playNow?: boolean, replace?: boolean) {
        if (replace) {
            this.queue = newQueue;
        } else {
            this.queue.concat(newQueue);
        }
        if (playNow) {
            this.playSong(this.queue[0]);
        }
    }

    togglePlay() {
        if (this.#audio.paused) {
            this.#audio.play()
        } else {
            this.#audio.pause()
        }
        return this.#audio.paused
    }

    nextSong() {
        this.index++
        console.log('NEXT SONG ' + this.index)
        this.currentSong = this.#queue[this.index]
        this.playSong(this.currentSong)
    }

    prevSong() {
        if (this.currentTime > 5) {
            console.log('TEST')
            this.setCurrentTime(0)
        } else {
            this.index--
            this.currentSong = this.queue[this.index]
            this.playSong(this.currentSong)
        }
    }

    timeUpdate(evt:Event) {
        if (this.updateLocal === 10) {
            this.updateLocal = 0
        } else {
            this.updateLocal++
        }
        audioPlayer.currentTime = (evt.target as HTMLAudioElement).currentTime
    }
}

class Metadata {
    audioPlayer:AudioPlayer;
    #title = "Song title";
    #artist = "Song artist";
    album:string;
    path:string;

    constructor(audioPlayer:AudioPlayer) {
        this.audioPlayer = audioPlayer
    }

    get title() {
        return this.#title;
    }

    set title(title: string) {
        this.#title = title;
        this.audioPlayer.reactive.title = title;
    }

    get artist() {
        return this.#artist;
    }

    set artist(artist: string) {
        this.#artist = artist;
        this.audioPlayer.reactive.artist = artist;
    }

    setSongMetadata(song:FiretailSong) {
        this.updateMediaSession(song)
    }

    updateMediaSession(song:FiretailSong) {
        const metadata = {
            title: song.title,
            artist: song.artist,
            album: song.album,
            src: song.path
        }
        /*if (song.hasImage === 1) {
            let port = store.state.nav.port
            let artistAlbum = ''
            if (song.id === 'customSong') {
                artistAlbum = song.customImage
            } else {
                artistAlbum = `http://localhost:${port}/images/${(song.artist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
            }
            metadata['artwork'] = [{src: artistAlbum, sizes: '512x512', type: 'image/jpeg'}]
        }*/
        navigator.mediaSession.metadata = new window.MediaMetadata(metadata)
        navigator.mediaSession.setActionHandler('previoustrack', this.audioPlayer.prevSong)
        navigator.mediaSession.setActionHandler('nexttrack', this.audioPlayer.nextSong)
        try {
            navigator.mediaSession.setPositionState({
                duration: this.audioPlayer.duration,
                playbackRate: this.audioPlayer.playbackRate,
                position: this.audioPlayer.currentTime
            });
        } catch {
            //
        }
    }
}

export default AudioPlayer;