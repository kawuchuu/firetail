import Vue from 'vue'
import VueRouter from 'vue-router'
import SongList from './components/SongList'
import SimpleSongList from './components/SimpleSongList/SimpleSongList'
import Unknown from './components/Unknown'
import Artists from './components/Artists'
import store from '../store'
import tr from '../translation'

Vue.use(VueRouter)

const router = new VueRouter({
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
            path: '/:pathMatch(.*)',
            component: Unknown,
            name: 'Unknown'
        }
    ]
})

router.beforeEach((to, from, next) => {
    if (to.query.column && to.query.q) {
        store.dispatch('audio/getSpecificSongs', {
            column: to.query.column,
            q: to.query.q
        })
    } else if (to.query.view == 'artist_firetailnoselect') {
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
})

export default router