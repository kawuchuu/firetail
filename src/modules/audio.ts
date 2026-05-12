import FiretailSong from "../types/FiretailSong";
import {reactive, toRaw} from "vue";
import {audioPlayer} from "../renderer";
import {getResource} from "./get-resource";
import {scrobble, updateNowPlaying} from "./lastfm";
import {RepeatMode} from "../types/Common";

interface AudioStore {
    title: string;
    artist: string;
    currentTime: number;
    duration: number;
    currentSong: FiretailSong;
    paused: boolean;
    volume: number;
    shuffled: boolean;
    repeat: RepeatMode;
}

class AudioPlayer extends Audio {
    private _queue:FiretailSong[] = [];
    private _index = 0;
    private _id:string;
    private _currentSong: FiretailSong;
    updateLocal = 0;
    metadata: Metadata;
    reactive: AudioStore;
    haveScrobbledCurrent = false;
    lastPlayedTimestamp: number;
    private _appVolume = 1.0;
    private _shuffled = false;
    private _repeat = RepeatMode.NO_REPEAT;
    constructor() {
        super();
        this.volume = this._appVolume;
        this.addEventListener("ended", () => {
            switch(this.repeat) {
                case RepeatMode.NO_REPEAT: {
                    this.nextSong();
                    break;
                }
                case RepeatMode.REPEAT_ALL: {
                    if (this.index + 1 > this.queue.length - 1) {
                        this.index = 0;
                        this.currentSong = this.queue[0];
                        this.playSong(this.currentSong);
                    } else {
                        this.nextSong();
                    }
                    break;
                }
                case RepeatMode.REPEAT_ONE: {
                    this.currentTime = 0;
                    if (this.paused) this.play();
                    break;
                }
                default: {
                    this.nextSong();
                }
            }
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
            shuffled: this.shuffled,
            repeat: this.repeat
        });
        window.player.next(this.nextSong.bind(this));
        window.player.previous(this.prevSong.bind(this));
        window.player.pause(this.pause.bind(this));
        window.player.playPause(this.togglePlay.bind(this));
        window.player.stop(this.stop.bind(this));
        window.player.play(this.play.bind(this));
        window.player.seek((Offset: bigint) => {
            this.setCurrentTime(this.currentTime += (Number(Offset) / 1000000));
        });
        window.player.setPosition((TrackId: string, Position: bigint) => {
            this.setCurrentTime(Number(Position) / 1000000);
        });
        window.player.updateVolume((Volume: number) => {
            const clamp = Math.max(0, Math.min(1, Volume));
            this._appVolume = clamp;
            this.reactive.volume = clamp;
            super.volume = clamp;
        });
        window.player.updateShuffled((shuffled: boolean) => {
            this.shuffled = shuffled;
        });
        window.player.updateRepeat((mode: RepeatMode) => {
            this.repeat = mode;
        });
    }

    get appVolume() {
        return this._appVolume;
    }

    set appVolume(value: number) {
        const clamp = Math.max(0, Math.min(1, value));
        this._appVolume = clamp;
        this.reactive.volume = clamp;
        super.volume = clamp;
        window.player.onVolumeChange(clamp);
    }

    updateReactivePause() {
        this.reactive.paused = this.paused;
    }

    setCurrentTime(time:number) {
        this.currentTime = time;
        window.player.updatePosition(this.currentTime, true);
    }

    get queue() {
        return this._queue
    }

    set queue(songs) {
        this._queue = songs
    }

    get index() {
        return this._index
    }

    set index(id) {
        this._index = id
        console.log(this.index)
    }

    get currentSong() {
        return this._currentSong;
    }

    set currentSong(song) {
        this._currentSong = song;
        this.reactive.currentSong = song;
    }

    get shuffled() {
        return this._shuffled;
    }

    set shuffled(setTo: boolean) {
        if (setTo) {
            const spliced = this.queue.splice(this.index, 1);
            this.queue.sort(() => {
                return Math.random() - 0.5;
            });
            this.queue.unshift(spliced[0]);
            this.index = 0;
        } else {
            this.queue.sort((a, b) => {
                return (
                    a.albumArtist.localeCompare(b.albumArtist, undefined, { sensitivity: 'base' }) ||
                    a.album.localeCompare(b.album, undefined, { sensitivity: 'base' }) ||
                    a.disc - b.disc ||
                    a.trackNum - b.trackNum
                );
            });
        }
        this._shuffled = setTo;
        this.reactive.shuffled = setTo;
        window.player.onShuffleUpdate(this.shuffled);
    }

    get repeat() {
        return this._repeat;
    }

    set repeat(mode: RepeatMode) {
        if (!Object.values(RepeatMode).includes(mode)) {
            this._repeat = RepeatMode.NO_REPEAT;
            this.reactive.repeat = RepeatMode.NO_REPEAT;
        } else {
            this._repeat = mode;
            this.reactive.repeat = mode;
        }
        window.player.onRepeatUpdate(this.repeat);
    }

    doTimeUpdate(willDo:boolean) {
        if (willDo) this.addEventListener('timeupdate', this.timeUpdate);
        else this.removeEventListener('timeupdate', this.timeUpdate);
    }

    async playSong(song: FiretailSong) {
        if (!song || !song.path) return console.warn("Could not find song", song);
        this.src = getResource(song.path);
        this._id = song.id;
        this.currentSong = song;
        this.reactive.duration = song.realdur;
        this.metadata.title = song.title;
        this.metadata.artist = song.artist;
        this.metadata.setSongMetadata(song);
        window.player.updateMetadata(toRaw(song));
        window.player.onPlay();
        window.player.updatePosition(this.currentTime, true);
        await this.play().catch(err => {
            console.error(err);
        })
        updateNowPlaying(this.metadata.artist, this.metadata.title);
        this.lastPlayedTimestamp = Math.floor(Date.now() / 1000);
        this.haveScrobbledCurrent = false;
    }

    enqueue(newQueue: FiretailSong[], replace?: boolean, playNow?: boolean, atIndex?: number) {
        if (replace) {
            this.queue = [...newQueue];
        } else {
            this.queue = [...this.queue, ...newQueue];
        }
        if (playNow) {
            if (atIndex != null) this.index = atIndex;
            this.playSong(this.queue[atIndex]);
        }
        if (this.shuffled) this.shuffled = true;
    }

    togglePlay() {
        if (this.paused) {
            this.play();
            window.player.onPlay();
        } else {
            this.pause();
            window.player.onPause();
        }
        window.player.updatePosition(this.currentTime, true);
        return this.paused;
    }

    nextSong() {
        this.index++
        this.currentSong = this._queue[this.index]
        this.playSong(this.currentSong)
    }

    prevSong() {
        if (this.currentTime > 5) {
            this.setCurrentTime(0)
        } else {
            this.index--
            this.currentSong = this.queue[this.index]
            this.playSong(this.currentSong)
        }
    }

    stop() {
        //
    }

    timeUpdate() {
        if (this.updateLocal === 10) {
            this.updateLocal = 0
        } else {
            this.updateLocal++
        }
        audioPlayer.reactive.currentTime = audioPlayer.currentTime;
        if (!this.haveScrobbledCurrent && ((this.currentTime > this.duration / 2) || this.currentTime > 240) && this.lastPlayedTimestamp && this.duration > 30) {
          this.haveScrobbledCurrent = true;
          scrobble(this.metadata.artist, this.metadata.title, this.lastPlayedTimestamp);
        }
        window.player.updatePosition(this.currentTime, false);
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
        this.updateMediaSession(song);
    }

    updateMediaSession(song:FiretailSong) {
        if (window.process.platform === 'linux') return;
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