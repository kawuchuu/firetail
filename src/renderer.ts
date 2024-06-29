import { createApp } from 'vue';
import { setupI18n } from './translate';
import App from './App.vue';
import router from "./router";
import AudioPlayer from "./modules/audio";

export const audioPlayer = new AudioPlayer();
const app = createApp(App);
const i18n = setupI18n();

async function setupVue() {
    app.use(await i18n);
    app.use(router);
    app.mount('#app');
}

setupVue();