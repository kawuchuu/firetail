import Vue from 'vue'
import VueRouter from 'vue-router'
import SongList from './components/SongList.vue'
//import SimpleSongList from './components/SimpleSongList/SimpleSongList'
import Unknown from './components/UnknownView.vue'
import ArtistAlbumView from './components/ArtistAlbumView.vue'
import store from '../store'
import tr from '../translation'
import Settings from './components/settings/SettingsView.vue'
import Home from './components/HomeView.vue'
import HiddenView from './components/HiddenView.vue'
import VirtualList from 'vue-virtual-scroll-list'
import sort from '../modules/sort.js'
//import { bus } from '../main'

Vue.component('virtual-list', VirtualList)

/* class VueRouterEx extends VueRouter {
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
} */

Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        {
            path: '/songs',
            component: SongList,
            name: 'NoUpdate'
        },
        {
            path: '/artists',
            component: ArtistAlbumView,
            name: tr.t('ROUTER.ARTISTS'),
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
            name: tr.t('ROUTER.ALBUMS'),
            children: [
                {
                    path: '',
                    component: SongList,
                }
            ]
        },
        {
            path: '/genres',
            component: ArtistAlbumView,
            name: 'Genres',
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
            name: tr.t('SETTINGS.TITLE')
        },
        {
            path: '/home',
            component: Home,
            name: 'Home'
        },
        {
            path: '*',
            component: Unknown,
            name: 'Unknown'
        },
        {
            path: '/',
            component: HiddenView,
            name: 'Hidden'
        },
        {
            path: '/liked',
            component: SongList,
            name: 'Favourites'
        }
    ],
    history: true,
    root: '/'
})

let isDoneOnce = false

window.ipcRenderer.receive('updateNav', (event, checkNav) => {
    store.commit('nav/updateCheckNav', checkNav)
})

router.beforeEach(async (to, from, next) => {
    window.scrollTo(0, 0)
    if (to.path != '/playlist') {
        store.commit('audio/updateCurrentList', [])
    }
    if (to.query.column && to.query.q) {
        store.dispatch('audio/getSpecificSongs', {
            column: [to.query.column, to.query.albumArtist ? to.query.albumArtist : null],
            q: to.query.q
        })
    } else if (to.query.view == 'firetailnoselect') {
        store.commit('audio/getNoSongs')
    } else if (to.path == '/playlist' && to.query.id) {
        const playlist = await window.ipcRenderer.invoke('getSpecificPlaylist', to.query.id)
        const sortedSongs = sort.sortArrayNum(JSON.parse(playlist[0].songIds), 'position')
        const ids = []
        sortedSongs.forEach(song => {
            ids.push(song.id)
        })
        const songs = await window.ipcRenderer.invoke('getSomeFromColumnMatches', ids)
        const sortedSongsToUse = []
        sortedSongs.forEach(song => {
            sortedSongsToUse.push(songs[0].find(item => item.id == song.id))
        })
        store.commit('audio/updateCurrentListNoSort', sortedSongsToUse)
        store.commit('audio/setCurrentListDur', songs[1])
        store.commit('playlist/setCurrentPlaylist', playlist[0])
    } else if (to.path == '/liked') {
        store.dispatch('audio/getAllFavourites')
    } else {
        store.dispatch('audio/getAllSongs')
    }
    if (to.path === '/genres') {
        const genreSongs = await window.ipcRenderer.invoke('getGenreResults', to.query.genre)
        store.commit('audio/updateCurrentList', genreSongs[0])
        store.commit('audio/setCurrentListDur', genreSongs[1])
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
        window.ipcRenderer.send('clearHistory')
        store.commit('nav/updateCheckNav', {
            back: false,
            true: false
        })
    }
})

export default router