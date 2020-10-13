import Vue from 'vue'
import VueRouter from 'vue-router'
import SongList from './components/SongList'
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
                    component: SongList,
                }
            ]
        },
        {
            path: '/:pathMatch(.*)',
            component: Unknown,
            name: tr.t('router.unknown')
        }
    ]
})

router.beforeEach((to, from, next) => {
    console.log(to)
    if (to.query.column && to.query.q) {
        store.dispatch('audio/getSpecificSongs', {
            column: to.query.column,
            q: to.query.q
        })
    } else {
        store.dispatch('audio/getAllSongs')
    }
    if (to.query.hideTop) {
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