import { createRouter, createWebHistory } from 'vue-router'

import SongList from '../components/screens/songlist/SongList'
import Unknown from '../components/screens/Unknown'

const routerHistory = createWebHistory()

const router = createRouter({
    history: routerHistory,
    routes: [
        {
            path: '/',
            component: SongList
        },
        {
            path: '/:pathMatch(.*)',
            component: Unknown
        }
    ]
})

export default router