<template>
    <div class="right-controls">
        <i @click="showQueue = !showQueue" class="ft-icon">queue</i>
        <QueuePopup :class="active" />
        <!-- <i class="material-icons">blur_on</i> -->
        <i @click="mute" class="ft-icon">{{volIcon}}</i>
        <div ref="volBarWrapper" class="vol-bar-inner-container" @mousemove="moveHover" @mouseover="hover" @mouseleave="leave" @mousedown="down">
            <div class="vol-bar" ref="volBar">
                <div ref="volFill" :style="fill" class="fill"></div>
                <div ref="volFillHover" class="fill-hover"></div>
                <div ref="handle" class="handle"></div>
                <!-- <div ref="hoverIndicate" class="vol-hover-indicate">{{ hoverIndicateNum }}</div> -->
            </div>
        </div>
        <i @click="enterExitZen" class="ft-icon">{{ fullscreenIcon }}</i>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import QueuePopup from './queue/QueuePopup.vue'
let clamp = (min, val, max) => {
    return Math.min(Math.max(min, val), max);
}

let getP = (e, el) => {
    let pBar = (e.clientX - el.getBoundingClientRect().x) / el.clientWidth;
    pBar = clamp(0, pBar, 1);
    return pBar;
}

export default {
    components: {
        QueuePopup
    },
    computed: {
        ...mapState('audio', {
            volume: state => state.volume,
            muted: state => state.muted,
            fill: state => {
                return `width: ${state.volume * 100}%`
            },
            volIcon: state => {
                if (state.volume == 0) {
                    return 'volume-mute'
                } else if (state.volume <= 0.5) {
                    return 'volume-mid'
                } else {
                    return 'volume-up'
                }
            }
        }),
        fullscreenIcon() {
            return this.$store.state.nav.fullscreen ? 'decrease' : 'expand'
        },
        active() {
            return this.showQueue ? 'active' : ''
        }
    },
    data() {
        return {
            volMouseDown: false,
            volMouseDownHover: false,
            unmuteVol: null,
            showQueue: false
        }
    },
    methods: {
        mute() {
            if (this.muted) {
                this.$store.commit('audio/setMute', false)
            } else {
                this.$store.commit('audio/setMute', true)
            }
        },
        move(evt) {
            if (!this.volMouseDown) return
            this.$refs.volFill.style.transition = 'none'
            let pBar = getP(evt, this.$refs.volBar)
            this.$store.commit('audio/setVolume', pBar)
            window.addEventListener('mousemove', this.move)
            window.addEventListener('mouseup', this.up)
            this.$refs.volFill.style.width = pBar * 100 + '%'
        },
        up(evt) {
            window.removeEventListener('mousemove', this.move)
            window.removeEventListener('mouseup', this.up)
            if (!this.volMouseDown) return
            this.volMouseDown = false
            this.$refs.volFill.style.removeProperty('transition')
            let pBar = getP(evt, this.$refs.volBar)
            this.$store.commit('audio/setVolume', pBar)
            window.addEventListener('mousemove', this.move)
            window.addEventListener('mouseup', this.up)
            this.$refs.volFill.style.width = pBar * 100 + '%'
            if (!this.volMouseDownHover) {
                this.$refs.handle.classList.remove('handle-hover')
            }
        },
        down(evt) {
            this.unmuteVol = null
            this.$store.commit('audio/setMute', false)
            let pBar = getP(evt, this.$refs.volBar)
            this.volMouseDown = true
            this.$store.commit('audio/setVolume', pBar)
            window.addEventListener('mousemove', this.move)
            window.addEventListener('mouseup', this.up)
            this.$refs.volFill.style.width = pBar * 100 + '%'
        },
        hover() {
            this.volMouseDownHover = true
            this.$refs.handle.classList.add('handle-hover')
            //this.$refs.volFillHover.classList.add('hover')
        },
        moveHover(evt) {
            let pBar = getP(evt, this.$refs.volBar)
            this.$refs.volFillHover.style.width = pBar * 100 + '%'
        },
        leave() {
            this.volMouseDownHover = false
            if (this.volMouseDown) return
            this.$refs.handle.classList.remove('handle-hover')
            this.$refs.volFillHover.classList.remove('hover')
        },
        enterExitZen() {
            this.$store.commit('nav/updateFullscreen', !this.$store.state.nav.fullscreen)
            window.ipcRenderer.send('set-fullscreen', this.$store.state.nav.fullscreen)
        }
    }
}
</script>

<style lang="scss" scoped>
.right-controls {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;

    i {
        font-size: 22px;
        cursor: pointer;
        margin-left: 20px;
        border-radius: 100px;
    }

    i:hover {
        opacity: 0.75;
    }

    i:active {
        opacity: 0.5;
    }

    i:last-child {
        margin-left: 0px;
    }
}

.vol-time-inner-container {
    width: 95%;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
}

.vol-bar-inner-container {
    padding: 3px 0px;
    margin: 0px 15px;
    position: relative;
    z-index: 15;
    display: flex;
    justify-content: center;
    cursor: pointer;
}

.vol-bar {
    margin: 10px 0px;
    width: 120px;
    background: var(--text-op);
    display: flex;
    align-items: center;
    border-radius: 999px;
    height: 4px;
    z-index: 5;
}

.vol-bar.hover, .fill.hover {
    height: 5px;
}

.fill {
    height: 4px;
    background: var(--hl-txt);
    border-radius: 10000px;
    transition: cubic-bezier(0, 1, 0.35, 1) .15s;
    width: 0%;
    z-index: 2;
}

.fill-hover {
    height: 4px;
    background-color: #ffffff36;
    border-radius: 10px;
    position: absolute;
    opacity: 0;
}

.handle {
    width: 0px;
    height: 0px;
    background: var(--hl-txt);
    border-radius: 11111px;
    margin-left: -5px;
    transform: scale(1.5);
    transition: all .1s;
    z-index: 3;
}

.vol-hover-indicate {
    background: var(--bd);
    border-radius: 5px;
    transform: scale(0);
    position: fixed;
    transition: 0.1s;
    transition-property: transform;
    padding: 5px 10px;
    left: 0;
    pointer-events: none;
}

.handle-hover {
    width: 10px !important;
    height: 10px !important;
    transition: all .1s !important;
}

.vol-hover-indicate.hover  {
    transform: scale(1) translateY(-30px);
}

.fill-hover.hover {
    opacity: 1;
}

.reduce-motion {
    .popup.queue {
        transform: translate(-160px, -315px);
    }
    .handle, .handle-hover, .fill {
        transition-duration: 0s !important;
    }
}

.rtl {
    .right-controls {

        i {
            margin-left: 0px;
            margin-right: 20px;
        }
    }
}
</style>