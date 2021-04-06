import Vue from 'vue'
import VueApp from './App.vue'
import store from './store'
import router from './router'
import i18n from './translation'
import AsyncComputed from 'vue-async-computed'
import { ipcRenderer } from 'electron'
export const bus = new Vue()
new Vue({
    i18n,
    router,
    store,
    render: h => h(VueApp)
}).$mount('#app')

Vue.use(AsyncComputed)

router.replace({ path: '/', query: { name: i18n.t('sidebar.songs'), view: 'all' } })

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