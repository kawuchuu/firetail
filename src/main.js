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
ipcRenderer.send('getlibrary')

ipcRenderer.addListener('getlibrary', (event, library) => {
    store.dispatch('updateSongStore', library)
})