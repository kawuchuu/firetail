import sort from '../../modules/sort'
import store from '../index'

const state = () => ({
    paused: true,
    songStore: [],
    currentTime: '-:--',
    duration: '-:--',
    songTitle: 'No song playing...',
    songArtist: '',
    currentSong: null,
    queue: [],
    currentList: []
})

const mutations = {
    mutUpdateSongStore(state, library) {
        state.songStore = library
    },
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
        state.currentSong = id
    },
    updateQueue(state, newQueue) {
        state.queue = newQueue
    },
    updateCurrentList(state, list) {
        state.currentList = list
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
    playSong(context, id) {
        let index = context.state.queue.indexOf(id)
        let song = context.state.songStore[index]
        if (!audio.src) {
            audio.addEventListener('ended', () => {
                context.dispatch('playSong', context.state.queue[context.state.queue.indexOf(context.state.currentSong) + 1])
            })
        }
        audio.src = `local-resource://${song.path}`
        context.commit('updateCurrentSong', id)
        context.commit('songMetadata', [song.title, song.artist])
        audio.play()
        audio.addEventListener('timeupdate', timeUpdate)
        audio.addEventListener('pause', () => {
            context.commit('updatePause')
        })
        audio.addEventListener('play', () => {
            context.commit('updatePause')
        })
    },
    removeTimeUpdate() {
        audio.removeEventListener('timeupdate', timeUpdate)
    },
    addTimeUpdate() {
        audio.addEventListener('timeupdate', timeUpdate)
    },
    updateSongStore(context, library) {
        let sortedLibrary = sort.sortArray(library, 'artist')
        context.commit('mutUpdateSongStore', sortedLibrary)
        this.commit('nav/updateScreenCountNum', sortedLibrary.length)
    },
    processQueue(context) {
        let doQueue = []
        context.state.currentList.forEach(f => {
            doQueue.push(f.id)
        })
        context.commit('updateQueue', doQueue)
    }
}

let audio = new Audio();

let timeUpdate = function() {
    store.commit('audio/timeUpdate', [audio.duration, audio.currentTime])
}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}