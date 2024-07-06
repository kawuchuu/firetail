import { createMemoryHistory, createRouter } from 'vue-router'

import SongListView from './routes/SongListView.vue'
import TestAudio from "./routes/TestAudio.vue";
import SongListItem from "./components/SongListItem.vue";
import BaseSongView from "./routes/BaseSongView.vue";

const routes = [
    {
        path: '/',
        component: SongListView,
        children: [
            {
                path: '',
                component: BaseSongView
            }
        ]
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router