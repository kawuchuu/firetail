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
    store.dispatch('updateSongStore', library)
})

ipcRenderer.send('library')