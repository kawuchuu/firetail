import { createRouter, createWebHistory } from 'vue-router'

import SongList from '../components/screens/songlist/SongList'
import Test from '../components/screens/Test'
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
            path: '/test',
            component: Test
        },
        {
            path: '/:pathMatch(.*)',
            component: Unknown
        }
    ]
})

export default router