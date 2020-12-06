<template>
    <div class="track-controls">
        <div class="track-controls-inner-container">
            <div class="control-buttons">
                <i class="material-icons-outlined repeat-shuffle" title="Shuffle" @click="shuffle" :class="isShuffled">shuffle</i>
                <i class="material-icons-outlined skip-prev" title="Previous" @click="prev">skip_previous</i>
                <i class="material-icons play-pause-icon" title="Play/pause" @click="playPause">{{playPauseIcon}}</i>
                <i class="material-icons-outlined skip-prev" title="Next" @click="next">skip_next</i>
                <i class="material-icons-outlined repeat-shuffle" title="Repeat" @click="repeat" :class="isRepeat">repeat</i>
            </div>
            <div class="seek-time-inner-container">
                <p class="song-duration" >{{ songCurrent }}</p>
                <div ref="seekBarWrapper" class="seek-bar-inner-container" @mousemove="moveHover" @mouseover="hover" @mouseleave="leave" @mousedown="down">
                    <div class="seek-bar" ref="seekBar">
                        <div ref="seekFill" :style="fill" class="fill"></div>
                        <div ref="seekFillHover" class="fill-hover"></div>
                        <div ref="handle" class="handle"></div>
                        <div ref="hoverIndicate" class="seek-hover-indicate">{{ hoverIndicateNum }}</div>
                    </div>
                </div>
                <p class="song-duration">{{ songDuration }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import time from '../../modules/timeformat'

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
            fill: state => {
                return `width: ${(state.currentTime / state.duration) * 100}%`
            },
            songDuration: state => {
                return time.timeFormat(state.duration)
            },
            rawSongDuration: state => state.duration,
            songCurrent: state => {
                if (typeof state.currentTime != 'number' || isNaN(state.currentTime)) {
                    return '-:--'
                } else {
                    return time.timeFormat(state.currentTime)
                }
            },
            playPauseIcon: state => {
                if (state.paused) {
                    return 'play_circle_filled'
                } else {
                    return 'pause_circle_filled'
                }
            },
            isShuffled: state => {
                if (state.shuffled) {
                    return 'active'
                } else {
                    return ''
                }
            },
            isRepeat: state => {
                if (state.repeat) {
                    return 'active'
                } else {
                    return ''
                }
            }
        })
    },
    data() {
        return {
            seekMouseDown: false,
            seekMouseOver: false,
            hoverIndicateNum: '-:--'
        }
    },
    methods: {
        ...mapActions('audio', ['playPause']),
        move(evt) {
            if (!this.seekMouseDown) return
            this.$refs.seekFill.style.transition = 'none'
            let pBar = getP(evt, this.$refs.seekBar)
            this.$refs.seekFill.style.width = pBar * 100 + '%'
            this.$refs.seekFillHover.style.width = pBar * 100 + '%'
            let seekBarWidth = this.$refs.seekBar.clientWidth
            let getPosition = (pBar * 100 * seekBarWidth) / 100
            let getHalfHoverIndicate = this.$refs.hoverIndicate.clientWidth / 2
            this.hoverIndicateNum = time.timeFormat(pBar * this.rawSongDuration)
            this.$refs.hoverIndicate.style.left = this.$refs.seekBar.getBoundingClientRect().left + getPosition - getHalfHoverIndicate + 'px'
        },
        up(evt) {
            window.removeEventListener('mousemove', this.move)
            window.removeEventListener('mouseup', this.up)
            if (!this.seekMouseDown) return
            this.seekMouseDown = false
            this.$refs.seekFill.style.removeProperty('transition')
            let pBar = getP(evt, this.$refs.seekBar)
            this.$refs.seekFill.width = pBar * 100 + '%'
            let seekBarWidth = this.$refs.seekBar.clientWidth
            let getPosition = (pBar * 100 * seekBarWidth) / 100
            let getHalfHoverIndicate = this.$refs.hoverIndicate.clientWidth / 2
            this.$refs.hoverIndicate.style.left = this.$refs.seekBar.getBoundingClientRect().left + getPosition - getHalfHoverIndicate + 'px'
            this.$store.dispatch('audio/addTimeUpdate')
            this.$store.commit('audio/newAudioTime', pBar * this.rawSongDuration)
            if (!this.seekMouseOver) {
                this.$refs.handle.classList.remove('handle-hover')
                this.$refs.hoverIndicate.classList.remove('hover')
                this.$refs.seekFillHover.classList.remove('hover')
            }
        },
        down(evt) {
            let pBar = getP(evt, this.$refs.seekBar)
            let seekBarWidth = this.$refs.seekBar.clientWidth
            let getPosition = (pBar * 100 * seekBarWidth) / 100
            let getHalfHoverIndicate = this.$refs.hoverIndicate.clientWidth / 2
            this.hoverIndicateNum = time.timeFormat(pBar * this.rawSongDuration)
            this.$refs.hoverIndicate.style.left = this.$refs.seekBar.getBoundingClientRect().left + getPosition - getHalfHoverIndicate + 'px'
            this.seekMouseDown = true
            this.$store.dispatch('audio/removeTimeUpdate')
            window.addEventListener('mousemove', this.move)
            window.addEventListener('mouseup', this.up)
            this.$refs.seekFill.style.width = pBar * 100 + '%'
        },
        hover() {
            this.seekMouseOver = true
            this.$refs.handle.classList.add('handle-hover')
            this.$refs.hoverIndicate.classList.add('hover')
            this.$refs.seekFillHover.classList.add('hover')
            //this.$refs.seekBar.classList.add('hover')
            //this.$refs.seekFill.classList.add('hover')
        },
        moveHover(evt) {
            let pBar = getP(evt, this.$refs.seekBar)
            let seekBarWidth = this.$refs.seekBar.clientWidth
            let getPosition = (pBar * 100 * seekBarWidth) / 100
            let getHalfHoverIndicate = this.$refs.hoverIndicate.clientWidth / 2
            this.hoverIndicateNum = time.timeFormat(pBar * this.rawSongDuration)
            this.$refs.hoverIndicate.style.left = this.$refs.seekBar.getBoundingClientRect().left + getPosition - getHalfHoverIndicate + 'px'
            this.$refs.seekFillHover.style.width = pBar * 100 + '%'
        },
        leave() {
            this.seekMouseOver = false
            if (this.seekMouseDown) return
            this.$refs.handle.classList.remove('handle-hover')
            this.$refs.hoverIndicate.classList.remove('hover')
            this.$refs.seekFillHover.classList.remove('hover')
            //this.$refs.seekBar.classList.remove('hover')
            //this.$refs.seekFill.classList.remove('hover')
        },
        next() {
            this.$store.dispatch('audio/playSong', this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex + 1])
        },
        prev() {
            this.$store.dispatch('audio/playSong', this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex - 1])
        },
        shuffle() {
            this.$store.commit('audio/doShuffle')
        },
        repeat() {
            this.$store.commit('audio/toggleRepeat')
        }
    }
}
</script>

<style lang="scss" scoped>
.track-controls {
    overflow: hidden;
    width: 40%;
    height: 100%;
    z-index: 15;
    display: flex;
    flex-direction: row;
}

.track-controls-inner-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%
}

.seek-time-inner-container {
    width: 95%;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
}

.seek-bar-inner-container {
    padding-top: 3px;
    padding-bottom: 3px;
    position: relative;
    z-index: 15;
    width: 100%;
    display: flex;
    justify-content: center;
    cursor: pointer;

}

.seek-bar {
    margin: 10px 0px;
    width: 100%;
    background: var(--bd);
    display: flex;
    align-items: center;
    border-radius: 999px;
    height: 4px;
    z-index: 5;
}

.seek-bar.hover, .fill.hover {
    height: 5px;
}

.fill {
    height: 4px;
    //background: linear-gradient(to right, var(--gradient1), var(--gradient2));
    background: var(--hl-txt);
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
    background: var(--hl-txt);
    border-radius: 11111px;
    margin-left: -5px;
    transform: scale(1.5);
    transition: all .1s;
    z-index: 3;
}

.seek-hover-indicate {
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

.seek-hover-indicate.hover  {
    transform: scale(1) translateY(-30px);
}

.fill-hover.hover {
    opacity: 1;
}

.song-duration {
    margin: 0 15px;
    position: relative;
    min-width: 25px;
    max-width: 25px;
    text-align: right;
    font-size: 12px;
}

#songDurationLength {
    text-align: left;
}

.control-buttons {
    display: flex;
    align-items: center;
    height: 36px;
}

.control-buttons i {
    margin: 5px;
    padding: 5px;
}

.play-pause-icon {
    font-size: 38px;
}

.skip-prev {
    font-size: 30px;
}

.repeat-shuffle {
    font-size: 22px;
}

.active {
    background-color: var(--hl-op);
    border-radius: 100px;
    color: var(--hl-txt)
}

.control-buttons i:hover, #closeSidemenu:hover, #albumArtistBack:hover, .playing-bar-hidden i:hover, .top-controls i:hover {
    opacity: 0.6;
    cursor: pointer;
}
</style>