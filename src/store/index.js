import Vuex from 'vuex'
import Vue from 'vue'
import audio from './modules/audio'
import nav from './modules/nav'
import panel from './modules/panel'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        audio,
        nav,
        panel
    }
})

export default store