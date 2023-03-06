import Vue from 'vue'
import VueApp from './App.vue'
import store from './store'
import router from './router'
import i18n from './translation'
import AsyncComputed from 'vue-async-computed'
import { ipcRenderer } from 'electron'
export const contextMenuBus = new Vue()
export const bus = new Vue()
new Vue({
    i18n,
    router,
    store,
    render: h => h(VueApp)
}).$mount('#app')

Vue.use(AsyncComputed)

router.replace({ path: '/', query: { name: i18n.t('SIDEBAR.SONGS'), view: 'all' } })

ipcRenderer.on('library', (event, library) => {
    store.commit('audio/updateCurrentList', library)
    ipcRenderer.send('getAllFromColumn', 'artist')
    ipcRenderer.send('getAllFromColumnWithArtist')
    ipcRenderer.once('getAllWithColumnArtist', (event, args) => {
        store.commit('nav/updateAlbums', args)
    })
})

ipcRenderer.on('libraryMid', (event, library) => {
    store.commit('audio/updateCurrentList', library)
})

ipcRenderer.on('getAllFromColumn', (event, type) => {
    if (type[0] == 'artist') {
        store.commit('nav/updateArtists', type[1])
    }
})

ipcRenderer.send('library')
ipcRenderer.send('getFavourites')

ipcRenderer.on('getFavourites', (event, ids) => {
    let favs = []
    ids.forEach(f => {
        favs.push(f.id)
    })
    store.commit('nav/updateFavouriteSongs', favs)
})

ipcRenderer.on('playCustomSong', (event, args) => {
    store.commit('audio/genNewQueue', [args])
    store.dispatch('audio/playSong', args, true)
})

ipcRenderer.once('enableCDBurn', () => {
    store.commit('nav/enableCDBurn')
    ipcRenderer.on("burnStarted", (event, jobId) => {
        console.log(`Burn job ${jobId} started`);
    });
    ipcRenderer.on("burnComplete", (event, jobId) => {
        console.log(`Burn job ${jobId} complete`);
    });
    ipcRenderer.on("burnFailed", (event, jobId) => {
        console.log(`Burn job ${jobId} failed`);
    });
    ipcRenderer.on("burnProgress", (event, data) => {
        console.log(`Burn job ${data.jobId}: ${Math.round(data.progress / data.maximum * 100)}% complete...`);
    });
    ipcRenderer.on("burnDescription", (event, data) => {
        console.log(`Burn job ${data.jobId}: ${data.description}`);
    });
})

ipcRenderer.on('fullscreenUpdate', (event, arg) => {
    store.commit('nav/updateFullscreen', arg)
})

const refreshSpotify = async () => {
    const query = new URLSearchParams({
        'client_id': 'd1084781b7af46d6b6948192e372e4a6',
        'grant_type': 'refresh_token',
        'refresh_token': localStorage.getItem('refresh-token')
    })
    const resp = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: query.toString()
    })
    const data = await resp.json()
    if (data.error) return console.error(data)
    localStorage.setItem('sp-token', data.access_token)
    if (data.refresh_token) {
        localStorage.setItem('refresh-token', data.refresh_token)
    }
    localStorage.setItem('expires', Date.parse(new Date()) + (data.expires_in * 1000))
}

if (localStorage.getItem('sp-token')) {
    refreshSpotify()
}

//nav buttons on mouse is implemented poorly in electron (and by extension chromium)...
//simply causes weird nav problems. unfortunately it's best to disable them entirely.
window.addEventListener('mouseup', evt => {
    if (evt.button == 3 || evt.button == 4) {
        evt.preventDefault();
    }
})

window.addEventListener('keydown', evt => {
    if (store.state.audio.preventSpacePause) return
    if (evt.metaKey && (evt.key === 'ArrowDown' || evt.key === 'ArrowUp')) {
        evt.preventDefault()
        let key = 'up'
        if (evt.key === 'ArrowDown') key = 'down'
        changeVol(key)
    }
    if (!evt.metaKey && (evt.key === 'ArrowLeft' || evt.key === 'ArrowRight')) {
        evt.preventDefault()
        let direction = 'forward'
        if (evt.key === 'ArrowLeft') direction = 'backward'
        arrowChangeTime(direction)
    }
})

const changeVol = action => {
    const vol = Math.round((store.state.audio.volume + (action === 'up' ? 0.1 : -0.1)) * 10) / 10
    store.commit('audio/setVolume', vol)
}

const arrowChangeTime = direction => {
    let newTime = 0;
    const currentTime = store.state.audio.currentTime
    if (direction === 'forward') {
        newTime = currentTime + 5
    } else if (direction === 'backward') {
        newTime = currentTime - 5
    }
    store.commit('audio/newAudioTime', newTime)
}

ipcRenderer.on('updateHighContrast', (evt, enabled) => {
    window.localStorage.setItem('highContrast', enabled)
    console.log('highcontrast: ' + enabled)
    store.commit('nav/updateHighContrast', enabled)
    enabled ? document.documentElement.classList.add('high-contrast') : document.documentElement.classList.remove('high-contrast')
})

ipcRenderer.on('control', (evt, action) => {
    switch(action) {
        case 'playPause':
            store.dispatch('audio/playPause')
            break
        case 'stop':
            store.commit('audio/setStopState')
            break
        case 'next': {
            const curSong = store.state.audio.currentSongIndex
            const nextSong = store.state.audio.queue[curSong + 1]
            store.dispatch('audio/playSong', nextSong)
            break
        }
        case 'prev': {
            const curSong = store.state.audio.currentSongIndex
            const nextSong = store.state.audio.queue[curSong - 1]
            store.dispatch('audio/playSong', nextSong)
            break
        }
        case 'volUp': {
            changeVol('up')
            break
        }
        case 'volDown': {
            changeVol('down')
            break
        }
        case 'mute':
            store.commit('audio/setMute', !store.state.audio.muted)
            break
        case 'shuffle':
            store.commit('audio/doShuffle')
            break
        case 'repeat':
            store.commit('audio/toggleRepeat')
            break
        case 'preferences':
            if (router.currentRoute.path == '/settings') {
                bus.$emit('notifySwag', {
                    title: "You're already here!",
                    message: "No need to switch to this page :)"
                })
            } else {
                router.push('/settings')
            }
    }
})