import Vuex from 'vuex'
import Vue from 'vue'
import audio from './modules/audio'
import nav from './modules/nav'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        audio,
        nav
    }
})

export default store