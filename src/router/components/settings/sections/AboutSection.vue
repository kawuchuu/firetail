<template>
    <section>
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ABOUT")}}</SubtitleOption>
        <div class="about">
            <img draggable="false" src="../../../../assets/firetail.png">
            <div class="info">
                <div>
                    <h1>{{$t('APP_NAME')}}</h1>
                    <p>{{$t('SETTINGS.ABOUT.VERSION')}}{{version}}</p>
                    <p>{{$t('SETTINGS.ABOUT.COPYRIGHT')}}kawuchuu</p>
                </div>
                <div>
                    <p>{{$t('SETTINGS.ABOUT.BUG_REPORT')}}<a @click="openLink">{{$t('SETTINGS.ABOUT.BUG_REPORT_LINK')}}</a></p>
                    <span><a @click="viewTpl">Third-party licenses</a>, <a @click="viewChangelog">view changelog</a></span>
                </div>
                <p @click="isMoreOpen = isMoreOpen ? false : true" class="open-more"><i class="ft-icon">{{ moreIcon }}</i> Advanced information</p>
                <div class="advanced-info" :class="doShow">
                    <p>Build: {{build}}</p>
                    <p>Platform: {{platform}}</p>
                    <p>Platform version: {{platformVer}}</p>
                    <p>Architecture: {{arch}}</p>
                    <p>Electron: {{processVer.electron}}</p>
                    <p>Chromium: {{processVer.chrome}}</p>
                    <p>Node: {{processVer.node}}</p>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import StandardButton from "../../../../components/StandardButton.vue";
import SubtitleOption from "../options/SubtitleOption.vue"

export default {
  components: {SubtitleOption, StandardButton },
    data() {
        return {
            version: this.$store.state.nav.ver,
            build: this.$store.state.nav.buildNum,
            arch: window.process.arch,
            platform: window.process.platform,
            processVer: window.process.versions,
            platformVer: "unknown",
            isMoreOpen: false
        }
    },
    computed: {
        checkBuild() {
            if (this.build === 'unknown' || this.build === 'CUSTOM') return false
            else return true
        },
        moreIcon() {
            if (this.isMoreOpen) {
                return 'arrow-head-up'
            } else {
                return 'arrow-head-down'
            }
        },
        doShow() {
            if (this.isMoreOpen) {
                return 'show'
            } else {
                return ''
            }
        }
    },
    methods: {
        openLink() {
            window.ipcRenderer.send('openLink', `https://github.com/kawuchuu/firetail/issues`)
        },
        viewChangelog() {
            this.$store.commit('panel/updatePanelProps', {
                topMsg: 'Changelog',
                file: 'changelog.md'
            })
            this.$store.commit('panel/updatePanelComponent', 'MarkdownModule.vue')
            this.$store.commit('panel/updateActive', true)
        },
        viewTpl() {
            this.$store.commit('panel/updatePanelProps', {
                topMsg: 'Third-party licenses',
                file: 'tpl.txt'
            })
            this.$store.commit('panel/updatePanelComponent', 'MarkdownModule.vue')
            this.$store.commit('panel/updateActive', true)
        }
    },
    async mounted() {
        this.platformVer = await window.os.version()
    }
}
</script>

<style lang="scss" scoped>
img {
    width: 90px;
    height: 90px;
    margin-right: 30px;
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
    font-size: 1.8em;
}

.darwin h1 {
    letter-spacing: -0.01em;
}

p {
    margin: 10px 0px;
    /* opacity: 0.75; */
}

.bold-text h1 {
    font-weight: 800;
}

a {
    color: #3ea8ff;
    text-decoration: underline;
    cursor: pointer;
}

.open-more {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-bottom: 0px;

    i {
        margin-right: 10px;
        font-size: 22px;
    }
}

.open-more:hover {
    color: var(--hl-txt);
}

.open-more:active {
    color: var(--hl-txt);
    opacity: 0.5;
}

.advanced-info {
    position: absolute;
    transition: 0.25s;
    transition-property: transform opacity;
    opacity: 0;
    display: none;
    user-select: text;
}

.advanced-info.show {
    opacity: 1;
    display: block;
}

.rtl {
    img {
        margin-right: 0px;
        margin-left: 35px;
    }
}
</style>