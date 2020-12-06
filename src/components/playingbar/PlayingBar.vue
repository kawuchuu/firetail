<template>
    <div class="playing-bar">
        <PlayingMeta/>
        <PlayingControlsMid/>
        <PlayingControlsRight/>
    </div>
</template>

<script>
import PlayingMeta from './PlayingMeta'
import PlayingControlsMid from './PlayingControlsMid'
import PlayingControlsRight from './PlayingControlsRight'

export default {
    components: {
        PlayingMeta,
        PlayingControlsMid,
        PlayingControlsRight
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
    border-top: solid 1px var(--bd);
    box-shadow: 0px -1px 5px rgba(0, 0, 0, .15);
    display: flex;
    align-items: center;
}
</style>