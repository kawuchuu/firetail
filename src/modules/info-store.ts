import {reactive} from "vue";

const infoStore = reactive({
    version: 'unknown',
    year: '2026',
    lastfmProxyUrl: 'https://lfmproxy.kawuchuu.dev/'
});

export default infoStore;