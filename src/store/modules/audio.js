import sort from '../../modules/sort.js'
import store from '../index.js'
import tr from '../../translation'
import {bus} from '../../renderer.js'
import AudioPlayer from '../../modules/audio.js';

let audio = new Audio();

const audioPlayer = new AudioPlayer()

const state = () => ({
    paused: true,
    currentTime: '-:--',
    duration: '-:--',
    songTitle: tr.t('PLAYING_BAR.SONG_TITLE_NOT_PLAYING'),
    songArtist: '',
    currentSong: null,
    currentSongIndex: null,
    queue: [],
    currentList: [],
    shuffled: false,
    repeat: 'off',
    volume: 1,
    muted: false,
    preventSpacePause: false,
    isResumeState: false,
    isLoadingSongs: true,
    currentListDur: {
        total: 0,
        hours: 0,
        mins: 0,
        secs: 0
    },
    currentListDurNoZero: {
        total: 0,
        hours: 0,
        mins: 0,
        secs: 0
    }
})

const mutations = {
    audioTime(state) {
        if (audio) {
            state.currentTime = audio.currentTime
        }
    },
    newAudioTime(state, newTime) {
        if (audio) {
            audio.currentTime = newTime
            window.localStorage.setItem('lastPlayTime', audio.currentTime)
        }
    },
    audioDur(state) {
        if (audio) {
            state.duration = audio.duration
        }
    },
    timeUpdate(state, durCur) {
        state.duration = durCur[0]
        state.currentTime = durCur[1]
    },
    songMetadata(state, meta) {
        state.songTitle = meta[0]
        state.songArtist = meta[1]
    },
    updatePause(state) {
        if (audio.paused) {
            state.paused = true
        } else {
            state.paused = false
        }
    },
    updateCurrentSong(state, id) {
        state.currentSongIndex = id
    },
    updateCurrentSongString(state, id) {
        state.currentSong = id
    },
    genNewQueue(state, songs) {
        state.queue = songs
        if (state.shuffled) {
            this.commit('audio/doShuffle', true)
        }
        window.localStorage.setItem('currentQueue', JSON.stringify(state.queue))
        this.commit('nav/updatePlayingView', this.state.nav.currentView)
    },
    updateCurrentList(state, list) {
        if (!list || list.length > 0) {
            const finalList = doComplexSort(list)
            state.currentList = finalList
        } else {
            state.currentList = []
        }
        this.commit('nav/updateScreenCountNum', list.length)
    },
    updateCurrentListNoSort(state, list) {
        state.currentList = list
        this.commit('nav/updateScreenCountNum', list.length)
    },
    doShuffle(state, onlyShuffle) {
        let queue = state.queue
        let currentSong = state.queue[state.currentSongIndex]
        if (!state.shuffled || onlyShuffle) {
            state.queue = sort.shuffle(queue)
            state.shuffled = true
        } else {
            state.queue = doComplexSort(queue)
            state.currentSongIndex = state.queue.indexOf(currentSong)
            state.shuffled = false
        }
        if (store.state.nav.currentView == store.state.nav.playingView) {
            state.currentList = sort.sortArray(state.currentList, 'albumArtist')
        }
        if (state.shuffled || onlyShuffle) {
            let index = state.queue.indexOf(currentSong)
            state.queue.splice(index, 1)
            state.queue.splice(0, 0, currentSong)
            state.currentSongIndex = 0
        }
        window.localStorage.setItem('isShuffled', state.shuffled)
        window.localStorage.setItem('currentQueue', JSON.stringify(state.queue))
        let lastPlayed = window.localStorage.getItem('lastPlayed')
        if (lastPlayed) {
            lastPlayed = JSON.parse(lastPlayed)
            lastPlayed.songIndex = state.currentSongIndex
            window.localStorage.setItem('lastPlayed', JSON.stringify(lastPlayed))
        }
    },
    toggleRepeat(state) {
        switch(state.repeat) {
            case 'off':
                state.repeat = 'all'
                break;
            case 'all':
                state.repeat = 'one'
                break;
            case 'one':
                state.repeat = 'off'
                break;
            default:
                state.repeat = 'off'
        }
    },
    setVolume(state, vol) {
        if (vol > 1) vol = 1
        if (vol < 0) vol = 0
        audio.volume = vol
        state.volume = vol
    },
    setMute(state, mute) {
        state.muted = mute
        audio.muted = mute
        if (mute) state.volume = 0
        else state.volume = audio.volume
    },
    getNoSongs(state) {
        state.currentList = []
    },
    sortShuffleTop(state) {
        let currentSong = state.queue[state.currentSongIndex]
        let index = state.queue.indexOf(currentSong)
        state.queue.splice(index, 1)
        state.queue.splice(0, 0, currentSong)
        state.currentSongIndex = 0
    },
    setStopState(state) {
        state.songArtist = ''
        state.songTitle = tr.t('PLAYING_BAR.SONG_TITLE_NOT_PLAYING')
        state.queue = []
        if (audio.src) {
            audio.pause()
            audio.src == ''
            state.currentSong = null
            state.currentSongIndex = null
            state.currentTime = null
            state.duration = null
        }
    },
    setPauseSpace(state, option) {
        state.preventSpacePause = option
    },
    notLoadingSongs(state) {
        state.isLoadingSongs = false
    },
    setCurrentListDur(state, duration) {
        state.currentListDur = {
            total: duration,
            hours: ("0" + Math.floor(duration / 3600)).slice(-2),
            mins: ("0" + Math.floor((duration % 3600) / 60)).slice(-2),
            secs: ("0" + Math.floor(duration % 60)).slice(-2)
        }
        state.currentListDurNoZero = {
            total: duration,
            hours: Math.floor(duration / 3600),
            mins: Math.floor((duration % 3600) / 60),
            secs: Math.floor(duration % 60)
        }
    }
}

let updateLocal = 0

const actions = {
    playPause() {
        if (audio.paused) {
            audio.play()
        } else {
            audio.pause()
        }
    },
    async playSong(context, song, isCustom) {
        if (song == null && context.state.repeat == 'off') {
            context.commit('setStopState')
            return
        }
        if (!audio.src) {
            audio.addEventListener('ended', () => {  
                if (context.state.repeat == 'one') {
                    context.state.currentTime = 0
                    audio.play()
                } else if (context.state.repeat == 'all') {
                    context.dispatch('playSong', context.state.queue[0])
                } else {
                    context.dispatch('playSong', context.state.queue[context.state.currentSongIndex + 1])
                }
            })
        }
        audio.src = `local-resource://${song.path}`
        if (isCustom) {
            context.commit('updateCurrentSong', 0)
            context.commit('updateCurrentSongString', song.id)
        } else {
            context.commit('updateCurrentSong', context.state.queue.indexOf(song))
            context.commit('updateCurrentSongString', song.id)
        }
        context.commit('songMetadata', [song.title, song.artist])
        audio.addEventListener('timeupdate', timeUpdate)
        audio.addEventListener('pause', () => {
            context.commit('updatePause')
            try {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate,
                    position: audio.currentTime
                });
            } catch {}
        })
        audio.addEventListener('play', () => {
            context.commit('updatePause')
            if (audio.readyState !== 0) {
                try {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        playbackRate: audio.playbackRate,
                        position: audio.currentTime
                    });
                } catch {}
            }
        })
        if (!context.state.isResumeState) {
            await audio.play().catch(err => {
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
                songIndex: context.state.currentSongIndex
            }))
            window.localStorage.setItem('lastPlayTime', 0.1)
            window.ipcRenderer.send('addStatPlay', song.id)
        } else {
            context.state.isResumeState = false
        }
        updateLocal = 0
        updateMediaSession(song)
        //audioPlayer.playSong(song)
    },
    removeTimeUpdate() {
        audio.removeEventListener('timeupdate', timeUpdate)
    },
    addTimeUpdate(context) {
        audio.addEventListener('timeupdate', timeUpdate)
    },
    getAllSongs(context) {
        context.state.isLoadingSongs = true
        window.ipcRenderer.send('library')
    },
    getSpecificSongs(context, args) {
        context.state.isLoadingSongs = true
        window.ipcRenderer.send('getSomeFromColumn', [args.column, args.q])
    },
    getAllFavourites(context) {
        context.state.isLoadingSongs = true
        window.ipcRenderer.send('getFavouriteSongs')
    },
    resumeState(context) {
        if (context.state.queue[0] && context.state.queue[0].id == 'customSong') return
        const lastPlayedInfo = JSON.parse(window.localStorage.getItem('lastPlayed'))
        context.state.queue = JSON.parse(window.localStorage.getItem('currentQueue'))
        store.commit('nav/updatePlayingView', lastPlayedInfo.view)
        context.state.isResumeState = true
        store.dispatch('audio/playSong', lastPlayedInfo.song)
        context.state.currentSongIndex = lastPlayedInfo.songIndex
        audio.currentTime = window.localStorage.getItem('lastPlayTime')
        const isShuffled = window.localStorage.getItem('isShuffled')
        if (isShuffled && isShuffled == 'true') context.state.shuffled = true
    }
}

let timeUpdate = function() {
    if (updateLocal === 10) {
        window.localStorage.setItem('lastPlayTime', audio.currentTime)
        updateLocal = 0
    } else {
        updateLocal++
    }
    store.commit('audio/timeUpdate', [audio.duration, audio.currentTime])
}

const doComplexSort = list => {
    const sortBy = {}
    list.forEach(item => {
        if (!sortBy[item.albumArtist]) sortBy[item.albumArtist] = {}
        if (!sortBy[item.albumArtist][item.album]) sortBy[item.albumArtist][item.album] = []
        sortBy[item.albumArtist][item.album].push(item)
    })
    const sortKeys = sort.simpleSort(Object.keys(sortBy))
    const finalList = []
    sortKeys.forEach(artist => {
        const albums = sort.simpleSort(Object.keys(sortBy[artist]))
        albums.forEach(album => {
            sortBy[artist][album] = sortBy[artist][album].sort(function (a, b) {
                return a.trackNum - b.trackNum
            });
            sortBy[artist][album].forEach(item => {
                finalList.push(item)
            })
        })
    })
    return finalList
}

let updateMediaSession = song => {
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
    setSkipPrevButtons()
    navigator.mediaSession.metadata = new window.MediaMetadata(metadata)
    setSkipPrevButtons()
    try {
        navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime
        });
    } catch {}
}

let skip = () => {
    store.dispatch('audio/playSong', store.state.audio.queue[store.state.audio.currentSongIndex + 1])
}

let prev = () => {
    if (store.state.audio.currentTime < 5) {
        store.dispatch('audio/playSong', store.state.audio.queue[store.state.audio.currentSongIndex - 1])
    } else {
        store.commit('audio/newAudioTime', 0)
    }
}

let setSkipPrevButtons = () => {
    navigator.mediaSession.setActionHandler('previoustrack', prev);
    navigator.mediaSession.setActionHandler('nexttrack', skip);
}

window.addEventListener('keydown', evt => {
    switch(evt.key) {
        case ' ':
            if (store.state.audio.preventSpacePause) return
            evt.preventDefault()
            store.dispatch('audio/playPause')
        break
    }
})

export default {
    namespaced: true,
    state,
    actions,
    mutations
}