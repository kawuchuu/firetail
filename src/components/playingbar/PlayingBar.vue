<template>
    <div :class="canShowBar" @mouseover="over" @mouseleave="leave" class="playing-bar">
        <PlayingMeta/>
        <PlayingControlsMid/>
        <PlayingControlsRight/>
    </div>
</template>

<script>
import PlayingMeta from './PlayingMeta.vue'
import PlayingControlsMid from './PlayingControlsMid.vue'
import PlayingControlsRight from './PlayingControlsRight.vue'
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
    z-index: 13;
    width: 100vw;
    height: 85px;
    border-top: solid 1px var(--mono-bd);
    box-sizing: border-box;
    /* box-shadow: 0px -1px 5px rgba(0, 0, 0, .15); */
    display: grid;
    grid-template-columns: 1fr 50% 1fr;
    gap: 15px;
    align-items: center;
    transition: 0.25s;
    transition-property: transform;
    transform: translateY(0px);
    padding: 0px 15px;
}

.playing-bar.hidden {
    transform: translateY(90px);
}

@media (max-width: 970px) {
    .playing-bar {
        grid-template-columns: 30% 1fr 30px;
    }
}
</style>