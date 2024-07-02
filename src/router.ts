import { createMemoryHistory, createRouter } from 'vue-router'

import SongsView from './routes/SongsView.vue'
import TestAudio from "./routes/TestAudio.vue";

const routes = [
    { path: '/', component: SongsView },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

export default router