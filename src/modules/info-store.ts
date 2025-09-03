import {reactive} from "vue";

const infoStore = reactive({
    version: 'unknown',
    year: '2025',
    lastfmProxyUrl: 'http://localhost:3000/'
});

export default infoStore;