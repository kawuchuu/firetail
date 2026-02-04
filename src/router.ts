import {createRouter, createWebHistory} from 'vue-router'

import SongListView from './components/SongListView.vue'
import BaseSongTop from "./components/songlistviews/BaseSongTop.vue";
import BaseSongBottom from "./components/songlistviews/BaseSongBottom.vue";
import AllSongs from "./routes/AllSongs.vue";
import Albums from "./routes/Albums.vue";
import TestAudio from "./routes/TestAudio.vue";
import SettingsView from "./routes/SettingsView.vue";
import Unknown from "./routes/Unknown.vue";
import Artists from "./routes/Artists.vue";

const routes = [
    {
      path: '/:pathMatch(.*)*',
      component: Unknown
    },
    {
        path: '/home',
        component: TestAudio,
    },
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
    },
    {
        path: '/artists',
        component: Artists,
        children: [{
            path: ':artist',
            component: SongListView,
            children: [{
                path: '',
                components: {
                    top: BaseSongTop,
                }
            }]
        }]
    },
    {
        path: '/settings',
        component: SettingsView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router