<template>
    <div :class="canShowBar" @mouseover="over" @mouseleave="leave" class="playing-bar">
        <PlayingMeta/>
        <PlayingControlsMid/>
        <PlayingControlsRight/>
    </div>
</template>

<script>
import PlayingMeta from './PlayingMeta'
import PlayingControlsMid from './PlayingControlsMid'
import PlayingControlsRight from './PlayingControlsRight'
import {mapState} from 'vuex'

export default {
    components: {
        PlayingMeta,
        PlayingControlsMid,
        PlayingControlsRight
    },
    computed: mapState('nav', {
        canShowBar: function(state) {
            if (!state.fullscreen || this.isMouseOver) return ''
            if (state.zenMoveMouseActive) {
                return ''
            } else {
                return 'hidden'
            }
        }
    }),
    methods: {
        over() {
            this.isMouseOver = true
        },
        leave() {
            this.isMouseOver = false
        }
    },
    data() {
        return {
            isMouseOver: false
        }
    }
}
</script>

<style scoped>
.playing-bar {
    position: fixed;
    bottom: 0;
    z-index: 12;
    width: 100vw;
    height: 85px;
    background-color: #1e1e1e;
    border-top: solid 1px black;
    box-shadow: 0px -1px 5px rgba(0, 0, 0, .15);
    display: flex;
    align-items: center;
    color: white;
    transition: 0.25s;
    transition-property: transform;
    transform: translateY(0px);
}

.playing-bar.hidden {
    transform: translateY(90px);
}
</style>