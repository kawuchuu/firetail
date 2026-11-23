import FiretailSong from "../types/FiretailSong";
import {reactive, toRaw} from "vue";
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

interface ScheduledTrack {
    song: FiretailSong;
    index: number;
    buffer: AudioBuffer;
    source: AudioBufferSourceNode;
    startCtx: number;
    offset: number;
    ended: boolean;
}

const PRELOAD_SECONDS = 20;
const TICK_MS = 250;
const GC_DELAY_MS = 1500;

class AudioPlayer extends EventTarget {
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

    readonly playbackRate = 1;
    private readonly ctx: AudioContext;
    private readonly gain: GainNode;
    private current: ScheduledTrack | null = null;
    private next: ScheduledTrack | null = null;
    private playToken = 0;
    private nextToken = 0;
    private nextLoading = false;
    private _paused = true;
    private gcTimer: ReturnType<typeof setTimeout> | null = null;
    private keepAlive: HTMLAudioElement | null = null;
    private gapless: boolean;
    private readonly el: HTMLAudioElement;
    private elLoaded = false;

    constructor() {
        super();
        this.gapless = window.ftStoreSync.keyExists('gaplessPlayback');
        this.el = new Audio();
        this.el.preload = 'auto';
        this.el.addEventListener('ended', () => this.onElementEnded());
        this.ctx = new AudioContext({latencyHint: 'playback'});
        this.ctx.suspend();
        this.gain = this.ctx.createGain();
        this.gain.connect(this.ctx.destination);
        this.gain.gain.value = this._appVolume;
        if (window.process.platform !== 'linux') {
            this.keepAlive = new Audio(silentWavUrl());
            this.keepAlive.loop = true;
        }
        setInterval(() => {
            if (this._paused) return;
            if (this.gapless && this.current) {
                this.checkStalled();
                this.maybePrepareNext();
                this.dispatchEvent(new Event("timeupdate"));
            } else if (!this.gapless && this.elLoaded) {
                this.dispatchEvent(new Event("timeupdate"));
            }
        }, TICK_MS);
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
            this.setCurrentTime(this.currentTime + (Number(Offset) / 1000000));
        });
        window.player.setPosition((TrackId: string, Position: bigint) => {
            this.setCurrentTime(Number(Position) / 1000000);
        });
        window.player.updateVolume((Volume: number) => {
            const clamp = Math.max(0, Math.min(1, Volume));
            this._appVolume = clamp;
            this.reactive.volume = clamp;
            this.volume = clamp;
        });
        window.player.updateShuffled((shuffled: boolean) => {
            this.shuffled = shuffled;
        });
        window.player.updateRepeat((mode: RepeatMode) => {
            this.repeat = mode;
        });
    }

    get paused() {
        return this._paused;
    }

    get duration() {
        if (!this.gapless) return this.el.duration;
        return this.current ? this.current.buffer.duration : NaN;
    }

    get currentTime() {
        if (!this.gapless) return this.el.currentTime;
        const cur = this.current;
        if (!cur) return 0;
        const t = this.ctx.currentTime - cur.startCtx + cur.offset;
        return Math.max(0, Math.min(cur.buffer.duration, t));
    }

    set currentTime(time: number) {
        if (!this.gapless) {
            if (this.elLoaded) this.el.currentTime = time;
            return;
        }
        const cur = this.current;
        if (!cur) return;
        const offset = Math.max(0, Math.min(cur.buffer.duration, time));
        const pendingNext = this.next;
        this.cancelScheduledNext();
        this.startTrack(cur.buffer, cur.song, cur.index, offset);
        if (pendingNext) this.scheduleNext(pendingNext.buffer, pendingNext.song, pendingNext.index);
    }

    get volume() {
        return this.gain.gain.value;
    }

    set volume(value: number) {
        const v = Math.max(0, Math.min(1, value));
        this.gain.gain.value = v;
        this.el.volume = v;
    }

    async play() {
        if (this.gapless ? !this.current : !this.elLoaded) {
            if (this.currentSong) await this.playSong(this.currentSong);
            return;
        }
        if (this.gapless) {
            if (this.current!.ended) this.currentTime = 0;
            await this.ctx.resume();
        } else {
            await this.el.play().catch(err => console.error(err));
        }
        this.setPlaying(true);
    }

    pause() {
        if (this.gapless) {
            this.ctx.suspend();
        } else {
            this.el.pause();
        }
        this.setPlaying(false);
    }

    private setPlaying(playing: boolean) {
        this._paused = !playing;
        if (playing && this.gapless) this.keepAlive?.play().catch(() => {});
        else this.keepAlive?.pause();
        if (playing) {
            this.dispatchEvent(new Event("play"));
            this.dispatchEvent(new Event("playing"));
        } else {
            this.dispatchEvent(new Event("pause"));
        }
    }

    get gaplessEnabled() {
        return this.gapless;
    }

    async setGapless(enabled: boolean) {
        if (enabled === this.gapless) return;
        const song = this.currentSong;
        const hadTrack = this.gapless ? !!this.current : this.elLoaded;
        const position = this.currentTime;
        const wasPaused = this.paused;
        if (this.gapless) {
            this.playToken++;
            this.invalidateNext();
            this.releaseCurrent();
            this.ctx.suspend();
            this.keepAlive?.pause();
        } else {
            this.unloadElement();
        }
        this.gapless = enabled;
        if (song && hadTrack) await this.playSong(song, position, wasPaused);
    }

    private unloadElement() {
        this.el.pause();
        this.el.removeAttribute('src');
        this.el.load();
        this.elLoaded = false;
    }

    private onElementEnded() {
        if (this.gapless) return;
        const nextIndex = this.getNextIndex();
        if (nextIndex == null || !this.queue[nextIndex]) {
            this.setPlaying(false);
            this.dispatchEvent(new Event("ended"));
            return;
        }
        this.dispatchEvent(new Event("ended"));
        this.index = nextIndex;
        this.playSong(this.queue[nextIndex]);
    }

    get appVolume() {
        return this._appVolume;
    }

    set appVolume(value: number) {
        const clamp = Math.max(0, Math.min(1, value));
        this._appVolume = clamp;
        this.reactive.volume = clamp;
        this.volume = clamp;
        window.player.onVolumeChange(clamp);
    }

    updateReactivePause() {
        this.reactive.paused = this.paused;
    }

    setCurrentTime(time:number) {
        this.currentTime = time;
        this.reactive.currentTime = this.currentTime;
        window.player.updatePosition(this.currentTime, true);
    }

    get queue() {
        return this._queue
    }

    set queue(songs) {
        this._queue = songs
        this.invalidateNext();
    }

    get index() {
        return this._index
    }

    set index(id) {
        this._index = id
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
            const at = this.queue.indexOf(this.currentSong);
            if (at !== -1) this.index = at;
        }
        this._shuffled = setTo;
        this.reactive.shuffled = setTo;
        this.invalidateNext();
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
        this.invalidateNext();
        window.player.onRepeatUpdate(this.repeat);
    }

    doTimeUpdate(willDo:boolean) {
        if (willDo) this.addEventListener('timeupdate', this.timeUpdate);
        else this.removeEventListener('timeupdate', this.timeUpdate);
    }

    async playSong(song: FiretailSong, startAt = 0, startPaused = false) {
        if (!song || !song.path) return console.warn("Could not find song", song);
        const token = ++this.playToken;
        if (!this.gapless) return this.playSongElement(song, token, startAt, startPaused);
        this.invalidateNext();
        this.releaseCurrent();
        this.onTrackChange(song, song.realdur);
        let buffer: AudioBuffer;
        try {
            buffer = await this.decode(song);
        } catch (err) {
            console.error("Failed to decode", song.path, err);
            return;
        }
        if (token !== this.playToken || !this.gapless) return;
        this.startTrack(buffer, song, this.index, Math.min(startAt, buffer.duration));
        this.reactive.duration = buffer.duration;
        this.reactive.currentTime = this.currentTime;
        window.player.updatePosition(this.currentTime, true);
        if (startPaused) {
            this.ctx.suspend();
            this.setPlaying(false);
            return;
        }
        await this.ctx.resume().catch(err => console.error(err));
        this.setPlaying(true);
        this.maybePrepareNext();
    }

    private async playSongElement(song: FiretailSong, token: number, startAt: number, startPaused: boolean) {
        this.el.src = getResource(song.path);
        this.elLoaded = true;
        this.onTrackChange(song, song.realdur);
        if (startAt > 0) {
            await new Promise(resolve => this.el.addEventListener('loadedmetadata', resolve, {once: true}));
            if (token !== this.playToken) return;
            this.el.currentTime = startAt;
            this.reactive.currentTime = startAt;
            window.player.updatePosition(startAt, true);
        }
        if (startPaused) {
            this.setPlaying(false);
            return;
        }
        await this.el.play().catch(err => console.error(err));
        if (token !== this.playToken) return;
        this.setPlaying(true);
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
        const target = this.index + 1;
        const ready = this.next;
        if (ready && ready.index === target && ready.buffer !== this.current?.buffer) {
            this.cancelScheduledNext();
            this.playToken++;
            this.releaseCurrent();
            this.index = target;
            this.startTrack(ready.buffer, ready.song, target, 0);
            this.onTrackChange(ready.song, ready.buffer.duration);
            if (this._paused) this.play();
            return;
        }
        this.index = target;
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
        this.reactive.currentTime = this.currentTime;
        if (!this.haveScrobbledCurrent && ((this.currentTime > this.duration / 2) || this.currentTime > 240) && this.lastPlayedTimestamp && this.duration > 30) {
          this.haveScrobbledCurrent = true;
          scrobble(this.metadata.artist, this.metadata.title, this.lastPlayedTimestamp);
        }
        window.player.updatePosition(this.currentTime, false);
    }

    private async decode(song: FiretailSong): Promise<AudioBuffer> {
        const res = await fetch(getResource(song.path));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return this.ctx.decodeAudioData(await res.arrayBuffer());
    }

    private makeSource(buffer: AudioBuffer) {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.gain);
        return source;
    }

    private startTrack(buffer: AudioBuffer, song: FiretailSong, index: number, offset: number) {
        if (this.current) this.killSource(this.current.source);
        const source = this.makeSource(buffer);
        const startCtx = this.ctx.currentTime;
        source.start(startCtx, offset);
        const track: ScheduledTrack = {song, index, buffer, source, startCtx, offset, ended: false};
        source.onended = () => this.onSourceEnded(track);
        this.current = track;
    }

    private scheduleNext(buffer: AudioBuffer, song: FiretailSong, index: number) {
        const cur = this.current;
        if (!cur) return;
        const endCtx = cur.startCtx + (cur.buffer.duration - cur.offset);
        const startCtx = Math.max(endCtx, this.ctx.currentTime);
        const source = this.makeSource(buffer);
        source.start(startCtx);
        const track: ScheduledTrack = {song, index, buffer, source, startCtx, offset: 0, ended: false};
        source.onended = () => this.onSourceEnded(track);
        this.next = track;
        if (cur.ended) this.advance();
    }

    private onSourceEnded(track: ScheduledTrack) {
        if (track !== this.current) return;
        track.ended = true;
        if (this.next) {
            this.advance();
        } else if (this.nextLoading) {
        } else if (this.getNextIndex() != null) {
            this.maybePrepareNext(true);
        } else {
            this.finishQueue();
        }
    }

    private checkStalled() {
        const cur = this.current;
        if (!cur || this.nextLoading) return;
        const endCtx = cur.startCtx + (cur.buffer.duration - cur.offset);
        if (this.ctx.currentTime < endCtx + 0.75) return;
        if (this.next) {
            this.advance();
        } else if (!cur.ended) {
            this.onSourceEnded(cur);
        } else if (this.getNextIndex() != null) {
            this.maybePrepareNext(true);
        }
    }

    private advance() {
        const nxt = this.next;
        if (!nxt) return;
        const old = this.current;
        this.next = null;
        this.current = nxt;
        if (old && old.source !== nxt.source) this.killSource(old.source);
        this.index = nxt.index;
        this.onTrackChange(nxt.song, nxt.buffer.duration);
        this.dispatchEvent(new Event("ended"));
        if (old && old.buffer !== nxt.buffer) this.requestGC();
    }

    private getNextIndex(): number | null {
        if (this.repeat === RepeatMode.REPEAT_ONE) return this.index;
        if (this.index + 1 < this.queue.length) return this.index + 1;
        if (this.repeat === RepeatMode.REPEAT_ALL && this.queue.length > 0) return 0;
        return null;
    }

    private async maybePrepareNext(force = false) {
        const cur = this.current;
        if (!cur || this.next || this.nextLoading) return;
        if (!force && cur.buffer.duration - this.currentTime > PRELOAD_SECONDS) return;
        const nextIndex = this.getNextIndex();
        if (nextIndex == null) return;
        const song = this.queue[nextIndex];
        if (!song) return;
        if (nextIndex === cur.index && song === cur.song) {
            this.scheduleNext(cur.buffer, song, nextIndex);
            return;
        }
        const token = ++this.nextToken;
        this.nextLoading = true;
        try {
            const buffer = await this.decode(song);
            if (token !== this.nextToken) return;
            this.nextLoading = false;
            if (!this.current) return;
            this.scheduleNext(buffer, song, nextIndex);
        } catch (err) {
            if (token !== this.nextToken) return;
            this.nextLoading = false;
            console.error("Failed to decode next track", song.path, err);
            if (this.current?.ended) this.finishQueue();
        }
    }

    private invalidateNext() {
        this.nextToken++;
        this.nextLoading = false;
        const hadNext = this.next && this.next.buffer !== this.current?.buffer;
        this.cancelScheduledNext();
        if (hadNext) this.requestGC();
    }

    private cancelScheduledNext() {
        if (this.next) this.killSource(this.next.source);
        this.next = null;
    }

    private releaseCurrent() {
        if (!this.current) return;
        this.killSource(this.current.source);
        this.current = null;
        this.requestGC();
    }

    private killSource(source: AudioBufferSourceNode) {
        source.onended = null;
        try { source.stop(); } catch {}
        source.disconnect();
    }

    private finishQueue() {
        this.pause();
        this.dispatchEvent(new Event("ended"));
    }

    private onTrackChange(song: FiretailSong, duration: number) {
        this._id = song.id;
        this.currentSong = song;
        this.reactive.duration = duration;
        this.reactive.currentTime = this.currentTime;
        this.metadata.title = song.title;
        this.metadata.artist = song.artist;
        this.metadata.setSongMetadata(song);
        window.player.updateMetadata(toRaw(song));
        window.player.onPlay();
        window.player.updatePosition(this.currentTime, true);
        updateNowPlaying(this.metadata.artist, this.metadata.title);
        this.lastPlayedTimestamp = Math.floor(Date.now() / 1000);
        this.haveScrobbledCurrent = false;
    }

    private requestGC() {
        const gc = (globalThis as { gc?: () => void }).gc;
        if (typeof gc !== 'function') return;
        if (this.gcTimer) clearTimeout(this.gcTimer);
        this.gcTimer = setTimeout(() => {
            this.gcTimer = null;
            gc();
        }, GC_DELAY_MS);
    }
}

function silentWavUrl() {
    const sampleRate = 8000;
    const samples = sampleRate;
    const buf = new ArrayBuffer(44 + samples);
    const v = new DataView(buf);
    const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF'); v.setUint32(4, 36 + samples, true); str(8, 'WAVE');
    str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate, true);
    v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    str(36, 'data'); v.setUint32(40, samples, true);
    new Uint8Array(buf, 44).fill(128);
    return URL.createObjectURL(new Blob([buf], {type: 'audio/wav'}));
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
        navigator.mediaSession.setActionHandler('previoustrack', this.audioPlayer.prevSong.bind(this.audioPlayer))
        navigator.mediaSession.setActionHandler('nexttrack', this.audioPlayer.nextSong.bind(this.audioPlayer))
        navigator.mediaSession.setActionHandler('play', () => this.audioPlayer.play())
        navigator.mediaSession.setActionHandler('pause', () => this.audioPlayer.pause())
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
