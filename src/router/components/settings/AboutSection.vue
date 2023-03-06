<template>
    <div class="about">
        <img draggable="false" src="@/assets/firetail.png">
        <div class="info">
            <div>
                <h1>{{$t('APP_NAME')}}</h1>
                <p>{{$t('SETTINGS.ABOUT.VERSION')}}{{version}}<span v-show="checkBuild"> [{{build}}]</span>, {{ arch }}</p>
                <p>{{$t('SETTINGS.ABOUT.COPYRIGHT')}}kawuchuu</p>
            </div>
            <div>
                <p>{{$t('SETTINGS.ABOUT.BUG_REPORT')}}<a @click="openLink">{{$t('SETTINGS.ABOUT.BUG_REPORT_LINK')}}</a></p>
            </div>
        </div>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'

export default {
    data() {
        return {
            version: this.$store.state.nav.ver,
            build: this.$store.state.nav.buildNum,
            arch: process.arch
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
            ipcRenderer.send('openLink', `https://github.com/kawuchuu/firetail/issues`)
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
    align-items: center;
}
h1 {
    margin: 10px 0px;
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
</style>