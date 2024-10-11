// eslint-disable-next-line import/no-unresolved
import 'overlayscrollbars/overlayscrollbars.css';
import { createApp } from 'vue';
import { setupI18n } from './translate';
import App from './App.vue';
import router from "./router";
import AudioPlayer from "./modules/audio";
import virtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import viewStoreModule from "./modules/view-store";

export const audioPlayer = new AudioPlayer();
export const viewStore = viewStoreModule;
const app = createApp(App);
const i18n = setupI18n();

async function setupVue() {
    app.use(virtualScroller);
    app.use(await i18n);
    app.use(router);
    app.mount('#app');
}

setupVue();