<template>
    <div class="popup queue">
        <div class="queue-inner">
            <virtual-list
                :data-key="'id'"
                :data-sources="queue"
                :data-component="sQueue"
                :page-mode="true"
                :page-mode-el="'.queue-inner'"
            />
            <span v-if="remainingQueueLength > 40" class="more">...and {{ remainingQueueLength - 40 }} more songs</span>
        </div>
    </div>
</template>

<script>
import QueueItem from './QueueItem.vue'
import { mapState } from 'vuex'

export default {
    components: {
        QueueItem
    },
    data() {
        return {
            sQueue: QueueItem,
        }
    },
    computed: {
        ...mapState('audio', {
            queue: state => state.queue.slice(state.currentSongIndex, state.currentSongIndex + 40),
            remainingQueueLength: state => state.queue.slice(state.currentSongIndex).length
        })
    }
}
</script>

<style lang="scss" scoped>
.popup {
    position: fixed;
    z-index: 15;
    width: auto;
    height: 300px;
    background: var(--back-bg);
    border-radius: 10px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    pointer-events: none;
    opacity: 0;
    //transition: .15s;
    border: solid 1px var(--bd);
    transition: 0.2s cubic-bezier(0.17, 0.88, 0.25, 1.1);
    transition-property: transform opacity;
}

.popup::after {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: var(--back-bg);
    position: absolute;
    bottom: -8px;
    left: 124px;
    border: solid 1px var(--bd);
    border-radius: 2px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    z-index: 1;
}

.popup.active {
    opacity: 1;
    transform: translate(-10px, -315px) scale(1) !important;
    pointer-events: all;
}

.popup.queue {
    transform: translate(-40px, 0px) scale(0);
    width: 350px;
    height: 500px;

    .queue-inner {
        width: 100%;
        height: 100%;
        background: var(--back-bg);
        border-radius: 20px;
        position: relative;
        z-index: 2;
        overflow: hidden;
        overflow-y: auto;

        .more {
            font-size: 0.9em;
            padding: 15px 0px 10px 15px;
        }
    }
}
</style>