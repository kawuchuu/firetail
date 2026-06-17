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
import infoStoreModule from "./modules/info-store";
import {usePlugins} from "./plugins/usePlugins";

import * as Vue from 'vue';
import {timeFormat} from "./modules/timeformat";
;(window as any).FiretailVue = Vue;

export const audioPlayer = new AudioPlayer();
export const viewStore = viewStoreModule;
export const infoStore = infoStoreModule;
const app = createApp(App);
const i18n = setupI18n();

;(window as any).FiretailAPI = {
    audioPlayer,
    modules: {
        timeFormat,
    },
    library: window.library,
}

async function setupVue() {
    app.use(virtualScroller);
    app.use(await i18n);
    app.use(router);
    app.mount('#app');
}

async function setupApp() {
    const generalInfo = await window.setupApp.generalInfo();
    infoStore.version = generalInfo.version;
}

function loadSettings() {
    const classSettings = window.ftStoreSync.getCategory('class');
    for (const item in classSettings) {
        const setting = window.ftStoreSync.getItem(classSettings[item]);
        if (setting) {
            document.documentElement.classList.add(classSettings[item]);
        }
    }
}

const pluginStore = usePlugins();

async function loadPlugins() {
    await pluginStore.loadAll();
    for (const route of pluginStore.pluginRoutes.value) {
        router.addRoute({
            path: `/${route.routePath}`,
            name: route.routeName,
            component: route.component,
        })
    }
    console.log(router.getRoutes())
}

loadPlugins().then(() => {
    loadSettings();
    setupVue();
    setupApp();
});