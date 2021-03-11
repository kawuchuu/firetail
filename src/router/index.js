import Vue from 'vue'
import VueRouter from 'vue-router'
import SongList from './components/SongList'
import SimpleSongList from './components/SimpleSongList/SimpleSongList'
import Unknown from './components/Unknown'
import Artists from './components/Artists'
import Albums from './components/Albums'
import store from '../store'
import tr from '../translation'
import Settings from './components/settings/Settings'
import VueVirtualScroller from 'vue-virtual-scroller'
import { ipcRenderer } from 'electron'

Vue.use(VueVirtualScroller)

class VueRouterEx extends VueRouter {
    constructor(options) {
        super(options)
        this.matcher
        const {addRoutes} = this.matcher
        const {routes} = options

        this.routes = routes

        this.matcher.addRoutes = newRoutes => {
            this.routes.push(...newRoutes)
            addRoutes(newRoutes)
        }
    }
}

Vue.use(VueRouterEx)

const router = new VueRouterEx({
    routes: [
        {
            path: '/',
            component: SongList,
            name: 'NoUpdate'
        },
        {
            path: '/artists',
            component: Artists,
            name: tr.t('router.artists'),
            children: [
                {
                    path: '',
                    component: SimpleSongList,
                }
            ]
        },
        {
            path: '/albums',
            component: Albums,
            name: tr.t('router.albums'),
            children: [
                {
                    path: '',
                    component: SimpleSongList,
                }
            ]
        },
        {
            path: '/settings',
            component: Settings,
            name: tr.t('settings.title')
        },
        {
            path: '*',
            component: Unknown,
            name: 'Unknown'
        }
    ]
})

let isDoneOnce = false

ipcRenderer.on('updateNav', (event, checkNav) => {
    store.commit('nav/updateCheckNav', checkNav)
})

router.beforeEach((to, from, next) => {
    if (to.query.column && to.query.q) {
        store.dispatch('audio/getSpecificSongs', {
            column: to.query.column,
            q: to.query.q
        })
    } else if (to.query.view == 'firetailnoselect') {
        store.commit('audio/getNoSongs')
    } else {
        store.dispatch('audio/getAllSongs')
    }
    if (to.query.view) {
        store.commit('nav/updateCurrentView', to.query.view)
    }
    if (to.query.hideTop || to.name == 'Unknown') {
        store.commit('nav/updateTopVisible', false)
    } else {
        store.commit('nav/updateTopVisible', true)
    }
    if (to.name != 'NoUpdate') {
        store.commit('nav/updateScreenTitle', to.name)
    } else {
        store.commit('nav/updateScreenTitle', to.query.name)
    }
    next()
    if (!isDoneOnce) {
        isDoneOnce = true
        ipcRenderer.send('clearHistory')
        store.commit('nav/updateCheckNav', {
            back: false,
            true: false
        })
    }
})

export default router