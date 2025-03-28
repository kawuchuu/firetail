<template>
    <div class="background-effects">
        <div class="shadow" />
        <div class="album-art-shadow" />
        <div class="gradient" />
        <div class="colour-bg secondary" :style="getColourSecondary" :class="$store.state.nav.colourBarEnabled ? '' : 'hide'" />
        <div class="colour-bg primary" :style="getColour" :class="$store.state.nav.colourBarEnabled ? '' : 'hide'" />
    </div>
</template>

<script>
export default {
    computed: {
        getColour() {
            let colour = this.$store.state.nav.playingBarColour
            if (colour === null) return 'background: transparent'
            return `background-color: ${colour}`
        },
      getColourSecondary() {
        let colour = this.$store.state.nav.playingBarSecondaryColour
        if (colour === null) return 'background: transparent'
        return `background-color: ${colour}`
      },
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

/* this radial gradient has a curve so it looks smoother */
.gradient {
    position: absolute;
    width: 520px;
    height: 205px;
    bottom: 0;
    background: radial-gradient(
            100% 100% at bottom left,
            rgba(var(--back-bg-rgb), 0) 0%,
            rgba(var(--back-bg-rgb), 0.12109375) 6.25%,
            rgba(var(--back-bg-rgb), 0.234375) 12.5%,
            rgba(var(--back-bg-rgb), 0.33984375) 18.75%,
            rgba(var(--back-bg-rgb), 0.4375) 25%,
            rgba(var(--back-bg-rgb), 0.52734375) 31.25%,
            rgba(var(--back-bg-rgb), 0.609375) 37.5%,
            rgba(var(--back-bg-rgb), 0.68359375) 43.75%,
            rgba(var(--back-bg-rgb), 0.75) 50%,
            rgba(var(--back-bg-rgb), 0.80859375) 56.25%,
            rgba(var(--back-bg-rgb), 0.859375) 62.5%,
            rgba(var(--back-bg-rgb), 0.90234375) 68.75%,
            rgba(var(--back-bg-rgb), 0.9375) 75%,
            rgba(var(--back-bg-rgb), 0.96484375) 81.25%,
            rgba(var(--back-bg-rgb), 0.984375) 87.5%,
            rgba(var(--back-bg-rgb), 0.99609375) 93.75%,
            var(--back-bg) 100%
    ) no-repeat;
}

.colour-bg {
    position: absolute;
    width: 450px;
    height: 165px;
    z-index: -1;
    transform: translateX(-15px);
    opacity: 0.8;
    transition: .8s;
    bottom: 0;
    display: none;
}

.light .colour-bg {
    opacity: 1;
}

.colour-bg.primary {
  mix-blend-mode: color;
}

.colour-bg.secondary {
  mix-blend-mode: luminosity;
  opacity: 0.2;
}

.light .colour-bg.secondary {
    opacity: 0.4;
}

.colourBar .colour-bg {
    display: block;
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

.album-art-shadow {
    position: fixed;
    width: 55px;
    height: 55px;
    bottom: 15px;
    left: 15px;
    box-shadow: 0 0 50px var(--back-bg);
    z-index: 2;
}

.light .album-art-shadow {
    display: none;
}

.rtl {
    .shadow {
        margin-left: 0;
        margin-right: var(--sidebar-width);
    }

    .gradient {
        transform: rotate(180deg) rotateX(180deg);
    }

    .colour-bg {
        transform: none;
    }
}
</style>