import { createMemoryHistory, createRouter } from 'vue-router'

import SongListView from './routes/SongListView.vue'
import BaseSongTop from "./components/songlistviews/BaseSongTop.vue";
import BaseSongBottom from "./components/songlistviews/BaseSongBottom.vue";

const routes = [
    {
        path: '/',
        component: SongListView,
        children: [
            {
                name: 'top-view',
                path: '',
                components: {
                    top: BaseSongTop,
                    bottom: BaseSongBottom
                }
            }
        ]
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router