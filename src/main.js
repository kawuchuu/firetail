import Vue from 'vue'
import VueApp from './App.vue'
import store from './store'
import router from './router'
import i18n from './translation'
import AsyncComputed from 'vue-async-computed'
import { ipcRenderer } from 'electron'

new Vue({
    i18n,
    router,
    store,
    render: h => h(VueApp)
}).$mount('#app')

Vue.use(AsyncComputed)

store.commit('audio/updateSpotifyToken')

router.replace({ path: '/', query: { name: i18n.t('sidebar.songs'), view: 'all' } })

ipcRenderer.addListener('library', (event, library) => {
    store.commit('audio/updateCurrentList', library)
})

ipcRenderer.addListener('getAllFromColumn', (event, type) => {
    if (type[0] == 'artist') {
        store.commit('nav/updateArtists', type[1])
    }
})

ipcRenderer.send('library')
ipcRenderer.send('getAllFromColumn', 'artist')
ipcRenderer.send('getFavourites')

ipcRenderer.addListener('getFavourites', (event, ids) => {
    let favs = []
    ids.forEach(f => {
        favs.push(f.id)
    })
    store.commit('nav/updateFavouriteSongs', favs)
})

ipcRenderer.on('playCustomSong', (event, args) => {
    store.dispatch('audio/playSong', args, true)
})

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