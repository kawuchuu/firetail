import { createStore } from 'vuex'
import audio from './modules/audio'
import nav from './modules/nav'

const store = createStore({
    modules: {
        audio,
        nav
    }
})

export default store