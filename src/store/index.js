import Vuex from 'vuex'
import Vue from 'vue'
import audio from './modules/audio.js'
import nav from './modules/nav.js'
import panel from './modules/panel.js'
import playlist from './modules/playlist.js'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        audio,
        nav,
        panel,
        playlist,
    }
})

export default store