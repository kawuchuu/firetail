<template>
    <div class="root">
        <img class="img-bird" src="../../assets/crash-tree.svg"/>
        <div class="info">
            <h1>{{$t('ROUTER.UNKNOWN')}}</h1>
            <p>{{$t('ROUTER.UNKNOWN_DESC')}}</p>
            <div class="more-info">
                <div @click="isMoreOpen = isMoreOpen ? false : true" class="open-more"><i class="ft-icon">{{ moreIcon }}</i> More info</div>
                <div class="inner-swag" :class="doShow">
                    <p>The current path is: {{ path }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {ipcRenderer} from 'electron'

export default {
    computed: {
        path() {
            return this.$route.fullPath
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
        openIssue() {
            ipcRenderer.send('openLink', `https://github.com/kawuchuu/firetail/issues`)
        }
    },
    data() {
        return {
            isMoreOpen: false
        }
    },
    mounted() {
        this.$store.commit('nav/updateTopVisible', false)
    }
}
</script>

<style lang="scss" scoped>
.img-bird {
    height: 60vh;
    background-repeat: no-repeat;
}

a {
    color: #3ea8ff;
    text-decoration: underline;
    cursor: pointer;
}

.root {
    padding: 0px 75px;
    display: flex;
    height: 100%;

    align-items: center;
    justify-content: center;

    .info {
        margin-left: 50px;
        max-width: 720px;
    }

    p, h1 {
        margin: 0 0 20px;
    }

    h1 {
        font-size: 45px;
        letter-spacing: -0.025em;
    }
}

.open-more {
    display: flex;
    align-items: center;
    cursor: pointer;

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

.inner-swag {
    transform: translateY(-35px);
    position: absolute;
    margin-top: 15px;
    transition: 0.25s;
    transition-property: transform opacity;
    opacity: 0;
    pointer-events: none;
}

.inner-swag.show {
    transform: none;
    opacity: 1;
}
</style>