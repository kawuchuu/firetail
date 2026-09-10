import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'

import SongListView from './components/SongListView.vue'
import BaseSongTop from "./components/songlistviews/BaseSongTop.vue";
import BaseSongBottom from "./components/songlistviews/BaseSongBottom.vue";
import AllSongs from "./routes/AllSongs.vue";
import Albums from "./routes/Albums.vue";
import SettingsView from "./routes/SettingsView.vue";
import Unknown from "./routes/Unknown.vue";
import Artists from "./routes/Artists.vue";
import BlankChild from "./components/BlankChild.vue";
import PlaylistView from "./routes/PlaylistView.vue";
import Genres from "./routes/Genres.vue";

const routes = [
    {
      path: '/:pathMatch(.*)*',
      component: Unknown
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
        children: [
            {
                path: ':albumArtist/:album',
                component: SongListView,
                children: [{
                    path: '',
                    components: {
                        top: BaseSongTop,
                        bottom: BaseSongBottom
                    }
                }]
            },
            {
                path: '',
                component: BlankChild
            }
        ]
    },
    {
        path: '/artists',
        component: Artists,
        children: [
            {
                path: ':artist',
                component: SongListView,
                children: [{
                    path: '',
                    components: {
                        top: BaseSongTop,
                    }
                }]
            },
            {
                path: '',
                component: BlankChild
            }
        ]
    },
    {
        path: '/playlists/:id',
        component: PlaylistView,
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
        path: '/genres',
        component: Genres,
        children: [{
            path: ':id',
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
        path: '/settings',
        component: SettingsView
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router