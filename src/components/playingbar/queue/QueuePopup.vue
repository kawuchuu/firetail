<template>
    <div class="popup queue">
         <div class="queue-inner">
            <virtual-list class="queue-inner"
                :data-key="'id'"
                :data-sources="queue"
                :data-component="sQueue"
                :estimate-size="60"
            />
            <!-- <span v-if="remainingQueueLength > 40" class="more">...and {{ remainingQueueLength - 40 }} more songs</span> -->
         </div>
        <div class="queue-info">
            <div class="queue-info-inner">
                <span>{{currentPosition}}/{{fullQueueLength}}</span>
            </div>
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
            fullQueueLength: state => state.queue.length,
            remainingQueueLength: state => state.queue.slice(state.currentSongIndex).length,
            currentPosition: state => state.currentSongIndex + 1
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
    transition-property: transform, opacity;
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

.rtl {
    .popup.queue {
        transform: translate(90px, 0px) scale(0);
    }
    .popup.active {
        transform: translate(108px, -315px) scale(1) !important;
    }
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
    display: grid;
    grid-template-rows: 1fr 40px;

    .queue-inner {
        width: 100%;
        height: 100%;
        background: var(--back-bg);
        border-radius: 12px;
        position: relative;
        z-index: 2;
        overflow: hidden;
        overflow-y: auto;

        .more {
            font-size: 0.9em;
            padding: 15px 0px 10px 15px;
        }
    }

    .queue-info {
        width: 100%;
        height: 100%;
        background: var(--back-bg);
        z-index: 2;
        border-radius: 12px;
        display: flex;
        align-items: center;

        .queue-info-inner {
            padding: 12px;
        }
    }
}

.reduceMotion {
    .popup.queue {
        transform: translate(-10px, -315px) !important;
    }
}
</style>