import sort from '../../modules/sort'
import store from '../index'
import tr from '../../translation'
import { ipcRenderer } from 'electron'
import {bus} from '@/main'

let audio = new Audio();

const state = () => ({
    paused: true,
    currentTime: '-:--',
    duration: '-:--',
    songTitle: tr.t('playingBar.songTitleNotPlaying'),
    songArtist: '',
    currentSong: null,
    currentSongIndex: null,
    queue: [],
    currentList: [],
    shuffled: false,
    repeat: 'off',
    volume: 1
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
        if (state.shuffled) {
            state.queue = sort.shuffle(songs)
        } else {
            state.queue = songs
        }
        this.commit('nav/updatePlayingView', this.state.nav.currentView)
    },
    updateCurrentList(state, list) {
        if (!list || list.length > 0) {
            let sortedList = sort.sortArray(list, 'artist')
            state.currentList = sortedList
        } else {
            state.currentList = []
        }
        this.commit('nav/updateScreenCountNum', list.length)
    },
    updateCurrentListNoSort(state, list) {
        state.currentList = list
        this.commit('nav/updateScreenCountNum', list.length)
    },
    doShuffle(state) {
        let queue = state.queue
        let currentSong = state.queue[state.currentSongIndex]
        if (!state.shuffled) {
            state.queue = sort.shuffle(queue)
            state.shuffled = true
        } else {
            state.queue = sort.sortArray(queue, 'artist')
            state.shuffled = false
        }
        if (store.state.nav.currentView == store.state.nav.playingView) {
            state.currentList = sort.sortArray(state.currentList, 'artist')
        }
        let index = state.queue.indexOf(currentSong)
        state.queue.splice(index, 1)
        state.queue.splice(0, 0, currentSong)
        state.currentSongIndex = 0
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
        audio.volume = vol
        state.volume = vol
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
        state.songTitle = 'No song playing...'
        state.queue = []
    }
}

const actions = {
    playPause() {
        if (audio.paused) {
            audio.play()
        } else {
            audio.pause()
        }
    },
    playSong(context, song, isCustom) {
        if (song == null && context.state.repeat == 'off') {
            context.commit('setStopState')
            if (audio.src) {
                audio.pause()
                audio.src == ''
                context.state.currentSong = null
                context.state.currentSongIndex = null
                context.state.currentTime = null
                context.state.duration = null
            }
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
        audio.play().catch(err => {
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
        audio.addEventListener('timeupdate', timeUpdate)
        audio.addEventListener('pause', () => {
            context.commit('updatePause')
        })
        audio.addEventListener('play', () => {
            context.commit('updatePause')
        })
        updateMediaSession(song)
    },
    removeTimeUpdate() {
        audio.removeEventListener('timeupdate', timeUpdate)
    },
    addTimeUpdate() {
        audio.addEventListener('timeupdate', timeUpdate)
    },
    getAllSongs() {
        ipcRenderer.send('library')
    },
    getSpecificSongs(context, args) {
        ipcRenderer.send('getSomeFromColumn', [args.column, args.q])
    }
}

let timeUpdate = function() {
    store.commit('audio/timeUpdate', [audio.duration, audio.currentTime])
}

let updateMediaSession = song => {
    let metadata = {
        title: song.title,
        artist: song.artist,
        album: song.album,
    }
    if (song.hasImage == 1) {
        let port = store.state.nav.port
        let artistAlbum = ''
        if (song.id == 'customSong') {
            artistAlbum = song.customImage
        } else {
            artistAlbum = `http://localhost:${port}/${(song.artist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
        }
        metadata['artwork'] = [{src: artistAlbum, sizes: '512x512', type: 'image/jpeg'}]
    }
    setSkipPrevButtons()
    navigator.mediaSession.metadata = new window.MediaMetadata(metadata)
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

export default {
    namespaced: true,
    state,
    actions,
    mutations
}