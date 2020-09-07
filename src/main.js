import { createApp } from 'vue'
import VueApp from './App.vue'
import store from './store'
import router from './router'
import { ipcRenderer } from 'electron'

const mainApp = createApp(VueApp)

mainApp.use(store)
mainApp.use(router)

mainApp.mount("#app")
router.replace('/')

ipcRenderer.addListener('library', (event, library) => {
    library.forEach((f, i) => {
        f['id'] = i
    })
    console.log(library)
    store.dispatch('audio/updateSongStore', library)
})

ipcRenderer.send('library')