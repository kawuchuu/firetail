import {createRouter, createWebHistory} from 'vue-router'

import SongListView from './components/SongListView.vue'
import BaseSongTop from "./components/songlistviews/BaseSongTop.vue";
import BaseSongBottom from "./components/songlistviews/BaseSongBottom.vue";
import AllSongs from "./routes/AllSongs.vue";
import Albums from "./routes/Albums.vue";

const routes = [
    {
        path: '/',
        component: AllSongs,
        children: [{
            path: '',
            component: SongListView,
            children: [{
                path: '',
                components: {
                    top: BaseSongTop,
                    bottom: BaseSongBottom
                }
            }]
        }]
    },
    {
        path: '/albums',
        component: Albums,
        children: [{
            path: ':albumArtist/:album',
            component: SongListView,
            children: [{
                path: '',
                components: {
                    top: BaseSongTop,
                    bottom: BaseSongBottom
                }
            }]
        }]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router