import Vue from 'vue'
import VueRouter from 'vue-router'
import SongList from './components/SongList'
//import SimpleSongList from './components/SimpleSongList/SimpleSongList'
import Unknown from './components/Unknown'
import ArtistAlbumView from './components/ArtistAlbumView'
import store from '../store'
import tr from '../translation'
import Settings from './components/settings/Settings'
import VirtualList from 'vue-virtual-scroll-list'
import sort from '../modules/sort'
import { ipcRenderer } from 'electron'
//import { bus } from '../main'

Vue.component('virtual-list', VirtualList)

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
            component: ArtistAlbumView,
            name: tr.t('router.artists'),
            children: [
                {
                    path: '',
                    component: SongList,
                }
            ]
        },
        {
            path: '/albums',
            component: ArtistAlbumView,
            name: tr.t('router.albums'),
            children: [
                {
                    path: '',
                    component: SongList,
                }
            ]
        },
        {
            path: '/playlist',
            component: SongList,
            name: 'Playlist'
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

router.beforeEach(async (to, from, next) => {
    window.scrollTo(0, 0)
    if (to.path != '/playlist') {
        store.commit('audio/updateCurrentList', [])
    }
    if (to.query.column && to.query.q) {
        store.dispatch('audio/getSpecificSongs', {
            column: to.query.column,
            q: to.query.q
        })
    } else if (to.query.view == 'firetailnoselect') {
        store.commit('audio/getNoSongs')
    } else if (to.path == '/playlist' && to.query.id) {
        const playlist = await ipcRenderer.invoke('getSpecificPlaylist', to.query.id)
        const sortedSongs = sort.sortArrayNum(JSON.parse(playlist[0].songIds), 'position')
        const ids = []
        sortedSongs.forEach(song => {
            ids.push(song.id)
        })
        const songs = await ipcRenderer.invoke('getSomeFromColumnMatches', ids)
        const sortedSongsToUse = []
        sortedSongs.forEach(song => {
            sortedSongsToUse.push(songs.find(item => item.id == song.id))
        })
        store.commit('audio/updateCurrentListNoSort', sortedSongsToUse)
        store.commit('playlist/setCurrentPlaylist', playlist[0])
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