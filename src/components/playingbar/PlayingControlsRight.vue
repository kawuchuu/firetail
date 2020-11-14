<template>
    <div class="right-controls">
        <i @click="mute" class="material-icons-outlined">{{volIcon}}</i>
        <div ref="volBarWrapper" class="vol-bar-inner-container" @mousemove="moveHover" @mouseover="hover" @mouseleave="leave" @mousedown="down">
            <div class="vol-bar" ref="volBar">
                <div ref="volFill" :style="fill" class="fill"></div>
                <div ref="volFillHover" class="fill-hover"></div>
                <div ref="handle" class="handle"></div>
                <!-- <div ref="hoverIndicate" class="vol-hover-indicate">{{ hoverIndicateNum }}</div> -->
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
let clamp = (min, val, max) => {
    return Math.min(Math.max(min, val), max);
}

let getP = (e, el) => {
    let pBar = (e.clientX - el.getBoundingClientRect().x) / el.clientWidth;
    pBar = clamp(0, pBar, 1);
    return pBar;
}

export default {
    computed: {
        ...mapState('audio', {
            volume: state => state.volume,
            fill: state => {
                return `width: ${state.volume * 100}%`
            },
            volIcon: state => {
                if (state.volume == 0) {
                    return 'volume_off'
                } else {
                    return 'volume_up'
                }
            }
        })
    },
    data() {
        return {
            volMouseDown: false,
            volMouseDownHover: false,
            unmuteVol: null
        }
    },
    methods: {
        mute() {
            if (this.volume > 0) {
                this.unmuteVol = this.volume
                this.$store.commit('audio/setVolume', 0)
            } else {
                if (this.unmuteVol == null) return
                this.$store.commit('audio/setVolume', this.unmuteVol)
                this.unmuteVol = null
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
        }
    }
}
</script>

<style lang="scss" scoped>
.right-controls {
    height: 100%;
    width: 30%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 15px;

    i {
        font-size: 20px;
        cursor: pointer;
    }

    i:hover {
        opacity: 0.75;
    }

    i:active {
        opacity: 0.5;
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
    padding: 3px 15px;
    position: relative;
    z-index: 15;
    display: flex;
    justify-content: center;
    cursor: pointer;
}

.vol-bar {
    margin: 10px 0px;
    width: 110px;
    background: var(--bd);
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
    background: linear-gradient(to right, var(--gradient1), var(--gradient2));
    border-radius: 10000px;
    transition: cubic-bezier(0, 1, 0.35, 1) .25s;
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
    background: var(--gradient2);
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
</style>