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

router.replace({ path: '/', query: { name: 'All Songs' } })

ipcRenderer.addListener('library', (event, library) => {
    library.forEach((f, i) => {
        f['id'] = i
    })
    console.log(library)
    store.dispatch('audio/updateSongStore', library)
})

ipcRenderer.send('library')