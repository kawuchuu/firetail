<template>
    <div class="track-controls">
        <div class="track-controls-inner-container">
            <div class="control-buttons">
                <i class="material-icons-outlined" id="shuffleButton" title="Shuffle">shuffle</i>
                <i class="material-icons-outlined" id="prevButton" title="Previous">skip_previous</i>
                <i class="material-icons-outlined" id="playPauseBtn" title="Play/pause" @click="playPause">{{playPauseIcon}}</i>
                <i class="material-icons-outlined" id="nextButton" title="Next">skip_next</i>
                <i class="material-icons-outlined" id="repeatButton" title="Repeat">repeat</i>
            </div>
            <div class="seek-time-inner-container">
                <p class="song-duration" id="songDurationTime">{{ songCurrent }}</p>
                <div id="seekWrapper" class="seek-bar-inner-container">
                    <div class="seek-bar">
                        <div id="seekFill" :style="fill" class="fill"></div>
                        <div id="seekHandle" class="handle"></div>
                    </div>
                </div>
                <p class="song-duration" id="songDurationLength">{{ songDuration }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import time from '../../modules/timeformat'

export default {
    computed: {
        ...mapState({
            fill: state => {
                return `width: ${(state.currentTime / state.duration) * 100}%`
            },
            songDuration: state => {
                if (typeof state.duration != 'number' || isNaN(state.duration)) {
                    return '-:--'
                } else {
                    return time.timeFormat(state.duration)
                }
            },
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
    methods: {
        ...mapActions(['playPause'])
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