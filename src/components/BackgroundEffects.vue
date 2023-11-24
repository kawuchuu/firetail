<template>
    <div class="background-effects">
        <div class="shadow" />
        <div class="colour-bg" :style="getColour" :class="$store.state.nav.colourBarEnabled ? '' : 'hide'" />
    </div>
</template>

<script>
export default {
    computed: {
        getColour() {
            let colour = this.$store.state.nav.playingBarColour
            if (colour == null) return 'background: transparent'
            return `background: radial-gradient(farthest-corner at bottom left, var(--fg-bg), transparent 60%), radial-gradient(farthest-corner at bottom left, ${colour}, transparent 60%)`
        }
    }
}
</script>

<style lang="scss" scoped>
.background-effects {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--back-bg);
    z-index: -1;
}

.colour-bg {
    position: absolute;
    width: 600px;
    height: 300px;
    z-index: -1;
    transform: translateX(-15px);
    opacity: 0.4;
    transition: .8s;
    bottom: 0;
}

.colour-bg.hide {
    display: none;
}

.shadow {
    position: fixed;
    height: calc(100vh - 129px);
    width: calc(100vw - var(--sidebar-width));
    margin-left: var(--sidebar-width);
    margin-top: 44px;
    box-shadow: 0px 0px 64px var(--back-bg), -2px 2px 30px var(--back-bg);
    border-radius: var(--main-border-radius);
    opacity: 0.6;
}
</style>