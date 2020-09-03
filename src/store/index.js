import { createStore } from 'vuex'
import sort from '../modules/sort'

const store = createStore({
    state: {
        paused: true,
        navs: [{
                icon: 'home',
                name: 'Home',
                id: 'homeTab',
                type: 'large_button',
                link: '/home'
            },
            {
                icon: 'settings',
                name: 'Settings',
                id: 'settingsTab',
                type: 'large_button',
                link: '/settings'
            },
            {
                name: 'Library',
                type: 'subtitle'
            },
            {
                icon: 'favorite_border',
                name: 'Liked Songs',
                id: 'likedTab',
                type: 'large_button',
                link: '/liked'
            },
            {
                icon: 'music_note',
                name: 'All Songs',
                id: 'songsTab',
                type: 'large_button',
                link: '/'
            },
            {
                icon: 'person',
                name: 'Artists',
                id: 'artistsTab',
                type: 'large_button',
                link: '/artists'
            },
            {
                icon: 'album',
                name: 'Albums',
                id: 'albumsTab',
                type: 'large_button',
                link: '/albums'
            },
            {
                name: 'Playlists',
                type: 'subtitle'
            }
        ],
        /*navs: [
            {
                icon: 'music_note',
                name: 'All Songs',
                id: 'songsTab',
                type: 'large_button',
                link: '/'
            },
            {
                icon: 'music_note',
                name: 'Test link',
                id: 'songsTab',
                type: 'large_button',
                link: '/test'
            }
        ],*/
        songStore: ['test'],
        currentTime: '-:--',
        duration: '-:--',
        screenTitle: 'All Songs',
        screenCountType: 'songs',
        screenCountNum: 0,
        songTitle: 'No song playing...',
        songArtist: ''
    },
    mutations: {
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
        updateScreenCountNum(state, num) {
            state.screenCountNum = num
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
        }
    },
    actions: {
        playPause() {
            if (audio.paused) {
                audio.play()
            } else {
                audio.pause()
            }
        },
        playSong(context, songLoc) {
            audio.src = `local-resource://${songLoc}`
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
            console.log(library)
            let sortedLibrary = sort.sortArray(library, 'artist')
            context.commit('mutUpdateSongStore', sortedLibrary)
            context.commit('updateScreenCountNum', sortedLibrary.length)
        }
    }
})

export default store

let audio = new Audio();

let timeUpdate = () => {
    store.commit('timeUpdate', [audio.duration, audio.currentTime])
}