<script setup lang="ts">
import PlayingMeta from "./PlayingMeta.vue";
import PlayingControlsMid from "./PlayingControlsMid.vue";
</script>

<template>
    <div class="playing-bar">
        <PlayingMeta />
        <PlayingControlsMid />
    </div>
</template>

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
    grid-template-columns: 1fr 45% 1fr;
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
        grid-template-columns: 1fr 1.5fr;
    }
}
</style>