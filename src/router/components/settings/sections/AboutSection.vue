<template>
    <section>
        <SubtitleOption>{{$t("SETTINGS.SUBTITLES.ABOUT")}}</SubtitleOption>
        <div class="about">
            <img draggable="false" src="../../../../assets/firetail.png">
            <div class="info">
                <div>
                    <h1>{{$t('APP_NAME')}}</h1>
                    <p>{{$t('SETTINGS.ABOUT.VERSION', { version })}}</p>
                    <p>{{$t('SETTINGS.ABOUT.COPYRIGHT', {year, author: 'kawuchuu'})}}</p>
                </div>
                <div>
                    <i18n path="SETTINGS.ABOUT.BUG_REPORT" tag="p">
                        <template v-slot:link>
                            <a @click="openLink">{{$t('SETTINGS.ABOUT.BUG_REPORT_LINK')}}</a>
                        </template>
                    </i18n>
                    <i18n path="SETTINGS.ABOUT.LICENSE_CHANGELOG" tag="span">
                        <template v-slot:license>
                            <a @click="viewTpl">{{$t('SETTINGS.ABOUT.THIRD_PARTY_LICENSE')}}</a>
                        </template>
                        <template v-slot:changelog>
                            <a @click="viewChangelog">{{$t('SETTINGS.ABOUT.VIEW_CHANGELOG')}}</a>
                        </template>
                    </i18n>
                </div>
                <p @click="isMoreOpen = isMoreOpen ? false : true" class="open-more"><i class="ft-icon">{{ moreIcon }}</i>{{$t('SETTINGS.ABOUT.ADVANCED_INFO_LABEL')}}</p>
                <div class="advanced-info" :class="doShow">
                    <p>{{$t('SETTINGS.ABOUT.ADVANCED_INFO.BUILD', {build})}}</p>
                    <p>{{$t('SETTINGS.ABOUT.ADVANCED_INFO.PLATFORM', {platform})}}</p>
                    <p>{{$t('SETTINGS.ABOUT.ADVANCED_INFO.PLATFORM_VER', {version: platformVer})}}</p>
                    <p>{{$t('SETTINGS.ABOUT.ADVANCED_INFO.ARCHITECTURE', {arch})}}</p>
                    <p>{{$t('SETTINGS.ABOUT.ADVANCED_INFO.ELECTRON', {version: processVer.electron})}}</p>
                    <p>{{$t('SETTINGS.ABOUT.ADVANCED_INFO.CHROMIUM', {version: processVer.chrome})}}</p>
                    <p>{{$t('SETTINGS.ABOUT.ADVANCED_INFO.NODE', {version: processVer.node})}}</p>
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
            isMoreOpen: false,
            year: this.$store.state.nav.year
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
    gap: 10px;

    i {
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