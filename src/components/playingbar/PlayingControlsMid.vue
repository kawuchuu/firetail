<template>
    <div class="track-controls">
        <div class="track-controls-inner-container">
            <div class="control-buttons">
                <i class="material-icons-outlined" title="Shuffle">shuffle</i>
                <i class="material-icons-outlined" title="Previous" @click="prev">skip_previous</i>
                <i class="material-icons-outlined" title="Play/pause" @click="playPause">{{playPauseIcon}}</i>
                <i class="material-icons-outlined" title="Next" @click="next">skip_next</i>
                <i class="material-icons-outlined" title="Repeat">repeat</i>
            </div>
            <div class="seek-time-inner-container">
                <p class="song-duration" >{{ songCurrent }}</p>
                <div ref="seekBarWrapper" class="seek-bar-inner-container" @mouseover="hover" @mouseleave="leave" @mousedown="down">
                    <div class="seek-bar" ref="seekBar">
                        <div ref="seekFill" :style="fill" class="fill"></div>
                        <div ref="handle" class="handle"></div>
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
                    return 'play_arrow'
                } else {
                    return 'pause'
                }
            }
        })
    },
    data() {
        return {
            seekMouseDown: false,
            seekMouseOver: false
        }
    },
    methods: {
        ...mapActions('audio', ['playPause']),
        move(evt) {
            if (!this.seekMouseDown) return
            this.$refs.seekFill.style.transition = 'none'
            let pBar = getP(evt, this.$refs.seekBar)
            this.$refs.seekFill.style.width = pBar * 100 + '%'
        },
        up(evt) {
            window.removeEventListener('mousemove', this.move)
            window.removeEventListener('mouseup', this.up)
            if (!this.seekMouseDown) return
            this.seekMouseDown = false
            this.$refs.seekFill.style.removeProperty('transition')
            let pBar = getP(evt, this.$refs.seekBar)
            this.$refs.seekFill.width = pBar * 100 + '%'
            this.$store.dispatch('audio/addTimeUpdate')
            this.$store.commit('audio/newAudioTime', pBar * this.rawSongDuration)
            if (!this.seekMouseOver) {
                this.$refs.handle.classList.remove('handle-hover')
            }
        },
        down(evt) {
            this.seekMouseDown = true
            this.$store.dispatch('audio/removeTimeUpdate')
            window.addEventListener('mousemove', this.move)
            window.addEventListener('mouseup', this.up)
            let pBar = getP(evt, this.$refs.seekBar)
            this.$refs.seekFill.style.width = pBar * 100 + '%'
        },
        hover() {
            this.seekMouseOver = true
            this.$refs.handle.classList.add('handle-hover')
        },
        leave() {
            this.seekMouseOver = false
            if (this.seekMouseDown) return
            this.$refs.handle.classList.remove('handle-hover')
        },
        next() {
            this.$store.dispatch('audio/playSong', this.$store.state.audio.queue[this.$store.state.audio.queue.indexOf(this.$store.state.audio.currentSong) + 1])
        },
        prev() {
            this.$store.dispatch('audio/playSong', this.$store.state.audio.queue[this.$store.state.audio.queue.indexOf(this.$store.state.audio.currentSong) - 1])
        }
    }
}
</script>

<style scoped>
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
    margin-bottom: 8px;
}

.seek-bar-inner-container {
    padding-top: 3px;
    padding-bottom: 3px;
    position: relative;
    z-index: 15;
    width: 95%;
    display: flex;
    justify-content: center;
}

.seek-bar {
    margin: 10px;
    width: 95%;
    background: var(--bd);
    display: flex;
    align-items: center;
    border-radius: 999px;
    height: 3px;
    z-index: 5
}

.fill {
    height: 3px;
    background: linear-gradient(to right, var(--gradient1), var(--gradient2));
    border-radius: 10000px;
    transition: cubic-bezier(0, 1, 0.35, 1) .25s;
    width: 0%;
}

.handle {
    width: 0px;
    height: 0px;
    background: var(--gradient2);
    border-radius: 11111px;
    margin-left: -5px;
    transform: scale(1.5);
    transition: all .1s;
}

.handle-hover {
    width: 7px !important;
    height: 7px !important;
    transition: all .1s !important;
}

.song-duration {
    margin: 0 5px;
    position: relative;
    min-width: 25px;
    max-width: 25px;
    text-align: right;
    font-size: 12px;
}

#songDurationLength {
    text-align: left;
}


.control-buttons i {
    margin: 5px;
    padding: 5px;
}

.control-buttons i:hover, #closeSidemenu:hover, #albumArtistBack:hover, .playing-bar-hidden i:hover, .top-controls i:hover {
    color: var(--hl-txt) !important;
    transform: scale(1.2);
    cursor: pointer;
}

</style>