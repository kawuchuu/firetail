import FiretailSong from "../types/FiretailSong";
import {reactive} from "vue";
import {audioPlayer} from "../renderer";
import {getAudioResource} from "./get-resource";

interface AudioStore {
    title: string;
    artist: string;
    currentTime: number;
    duration: number;
    currentSong: FiretailSong;
    paused: boolean;
    volume: number;
}

class AudioPlayer extends Audio {
    #queue:FiretailSong[] = [];
    #index = 0;
    #id:string;
    #currentSong: FiretailSong;
    updateLocal = 0;
    metadata: Metadata;
    reactive: AudioStore;
    constructor() {
        super();
        this.addEventListener("ended", () => {
            this.nextSong();
        });
        this.addEventListener("timeupdate", this.timeUpdate);
        this.addEventListener("pause", this.updateReactivePause);
        this.addEventListener("playing", this.updateReactivePause);
        this.metadata = new Metadata(this);
        this.reactive = reactive({
            title: this.metadata.title,
            artist: this.metadata.artist,
            currentTime: this.currentTime,
            duration: this.duration,
            currentSong: this.currentSong,
            paused: this.paused,
            volume: this.volume,
        });
    }

    updateReactivePause() {
        this.reactive.paused = this.paused;
    }

    setCurrentTime(time:number) {
        this.currentTime = time;
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
        if (willDo) this.addEventListener('timeupdate', this.timeUpdate);
        else this.removeEventListener('timeupdate', this.timeUpdate);
    }

    async playSong(song: FiretailSong) {
        if (!song || !song.path) return console.warn("Could not find song", song);
        this.src = getAudioResource(song.path);
        //console.log(this.audio.currentTime)
        this.#id = song.id;
        this.currentSong = song;
        this.reactive.duration = song.realdur;
        this.metadata.title = song.title;
        this.metadata.artist = song.artist;
        this.metadata.setSongMetadata(song)
        await this.play().catch(err => {
            console.error(err);
        })
    }

    enqueue(newQueue: FiretailSong[], replace?: boolean, playNow?: boolean, atIndex?: number) {
        if (replace) {
            this.queue = newQueue;
        } else {
            this.queue.concat(newQueue);
        }
        if (playNow) {
            if (atIndex) this.index = atIndex;
            this.playSong(this.queue[atIndex]);
        }
    }

    togglePlay() {
        if (this.paused) {
            this.play()
        } else {
            this.pause()
        }
        return this.paused
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
        audioPlayer.reactive.currentTime = audioPlayer.currentTime;
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