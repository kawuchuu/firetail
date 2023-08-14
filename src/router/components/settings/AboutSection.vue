<template>
    <div class="about">
        <img draggable="false" src="../../../assets/firetail.png">
        <div class="info">
            <div>
                <h1>{{$t('APP_NAME')}}</h1>
                <p>{{$t('SETTINGS.ABOUT.VERSION')}}{{version}}<span v-show="checkBuild"> [{{build}}]</span>, {{ arch }}</p>
                <p>{{$t('SETTINGS.ABOUT.COPYRIGHT')}}kawuchuu</p>
            </div>
            <div>
                <p>{{$t('SETTINGS.ABOUT.BUG_REPORT')}}<a @click="openLink">{{$t('SETTINGS.ABOUT.BUG_REPORT_LINK')}}</a></p>
                <a>Third-party licenses</a>
            </div>
        </div>
    </div>
</template>

<script>
import StandardButton from '../../../components/StandardButton.vue'

export default {
  components: { StandardButton },
    data() {
        return {
            version: this.$store.state.nav.ver,
            build: this.$store.state.nav.buildNum,
            arch: window.process.arch
        }
    },
    computed: {
        checkBuild() {
            if (this.build === 'unknown' || this.build === 'CUSTOM') return false
            else return true
        }
    },
    methods: {
        openLink() {
            window.ipcRenderer.send('openLink', `https://github.com/kawuchuu/firetail/issues`)
        }
    }
}
</script>

<style lang="scss" scoped>
img {
    width: 108px;
    height: 108px;
    margin-right: 35px;
    aspect-ratio: 1 / 1;
}
.about {
    display: flex;
    align-items: flex-start;
    margin-top: 30px;
}
h1 {
    margin: 0px 0px 10px;
    letter-spacing: -0.02em;
    font-weight: 600;
}

.darwin h1 {
    letter-spacing: -0.01em;
}

p {
    margin: 10px 0px;
    opacity: 0.75;
}

.bold-text h1 {
    font-weight: 800;
}

a {
    color: #3ea8ff;
    text-decoration: underline;
    cursor: pointer;
}

.rtl {
    img {
        margin-right: 0px;
        margin-left: 35px;
    }
}
</style>