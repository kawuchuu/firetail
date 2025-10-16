<script setup lang="ts">
import PlayingMeta from "./PlayingMeta.vue";
import PlayingControlsMid from "./PlayingControlsMid.vue";
import PlayingControlsRight from "./PlayingControlsRight.vue";
</script>

<template>
    <div class="playing-bar">
        <PlayingMeta />
        <PlayingControlsMid />
        <PlayingControlsRight />
    </div>
</template>

<style scoped>
.playing-bar {
    position: fixed;
    bottom: 0;
    width: calc(100vw - 30px);
    height: 85px;
    display: grid;
    grid-template-columns: 1fr 45% 1fr;
    gap: 15px;
    align-items: center;
    transition: 0.25s;
    transition-property: transform;
    transform: translateY(0px);
    padding: 0 15px;
}

.playing-bar.hidden {
    transform: translateY(90px);
}

@media (max-width: 970px) {
    .playing-bar {
        grid-template-columns: 1fr 1.5fr;
    }
}
</style>