import FiretailSong from "../types/FiretailSong";
import {reactive} from "vue";
import {audioPlayer} from "../renderer";
import {getResource} from "./get-resource";
import {scrobble, updateNowPlaying} from "./lastfm";

interface AudioStore {
    title: string;
    artist: string;
    currentTime: number;
    duration: number;
    currentSong: FiretailSong;
    paused: boolean;
    volume: number;
}

class AudioPlayer {
    #queue:FiretailSong[] = [];
    #index = 0;
    #id:string;
    #currentSong: FiretailSong;
    updateLocal = 0;
    metadata: Metadata;
    reactive: AudioStore;
    haveScrobbledCurrent = false;
    lastPlayedTimestamp: number;
    timeInterval: number | undefined;
    currentTime: number;
    duration: number;
    paused = true;
    constructor() {
        this.metadata = new Metadata(this);
        this.reactive = reactive({
            title: this.metadata.title,
            artist: this.metadata.artist,
            currentTime: 0,
            duration: 0,
            currentSong: this.currentSong,
            paused: true,
            volume: 1,
        });
    }

    updateReactivePause() {
        this.reactive.paused = this.paused;
    }

    async setCurrentTime(time:number) {
        await window.audioBackend.seek(time);
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
        if (willDo) {
          this.timeInterval ??= setInterval(this.timeUpdate, 500);
        } else {
          clearInterval(this.timeInterval);
          this.timeInterval = null;
        }
    }

    async playSong(song: FiretailSong) {
        if (!song || !song.path) return console.warn("Could not find song", song);
        this.#id = song.id;
        this.currentSong = song;
        this.reactive.duration = song.realdur;
        this.metadata.title = song.title;
        this.metadata.artist = song.artist;
        this.metadata.setSongMetadata(song)
        await window.audioBackend.play(song.path, 0);
        this.paused = false;
        this.updateReactivePause();
        //await window.audioBackend.playGapless(this.queue[this.index + 1].path);
        clearInterval(this.timeInterval);
        this.timeInterval = null;
        this.timeInterval ??= setInterval(this.timeUpdate, 500);
        updateNowPlaying(this.metadata.artist, this.metadata.title);
        this.lastPlayedTimestamp = Math.floor(Date.now() / 1000);
        this.haveScrobbledCurrent = false;
    }

    enqueue(newQueue: FiretailSong[], replace?: boolean, playNow?: boolean, atIndex?: number) {
        if (replace) {
            this.queue = newQueue;
        } else {
            this.queue.concat(newQueue);
        }
        if (playNow) {
            if (atIndex !== null) this.index = atIndex;
            this.playSong(this.queue[atIndex]);
        }
    }

    async togglePlay() {
        if (this.paused) {
            await window.audioBackend.resume();
            this.timeInterval ??= setInterval(this.timeUpdate, 500);
            this.paused = false;
        } else {
            await window.audioBackend.pause();
            clearInterval(this.timeInterval);
            this.timeInterval = null;
            this.paused = true;
        }
        this.updateReactivePause();
        return this.paused;
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

    async timeUpdate() {
        this.currentTime = await window.audioBackend.getCurrentTime();
        if (this.updateLocal === 10) {
            this.updateLocal = 0
        } else {
            this.updateLocal++
        }
        audioPlayer.reactive.currentTime = this.currentTime;
        if (!this.haveScrobbledCurrent && ((this.currentTime > this.duration / 2) || this.currentTime > 240) && this.lastPlayedTimestamp && this.duration > 30) {
          this.haveScrobbledCurrent = true;
          scrobble(this.metadata.artist, this.metadata.title, this.lastPlayedTimestamp);
        }
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