import Vue from 'vue'
import VueApp from './App.vue'
import store from './store'
import router from './router'
import i18n from './translation'
import { ipcRenderer } from 'electron'

new Vue({
    i18n,
    router,
    store,
    render: h => h(VueApp)
}).$mount('#app')

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