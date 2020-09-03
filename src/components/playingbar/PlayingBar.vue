<template>
    <div class="playing-bar">
        <PlayingMeta/>
        <PlayingControlsMid/>
    </div>
</template>

<script>
import PlayingMeta from './PlayingMeta'
import PlayingControlsMid from './PlayingControlsMid'

export default {
    components: {
        PlayingMeta,
        PlayingControlsMid
    }
}
</script>

<style scoped>
.playing-bar {
    position: fixed;
    bottom: 0;
    z-index: 2;
    width: 100vw;
    height: 85px;
    background-color: var(--fg-bg);
    border-top: solid 2px var(--bd);
    box-shadow: 0px -1px 5px rgba(0, 0, 0, .15);
    display: flex;
    align-items: center;
}
</style>