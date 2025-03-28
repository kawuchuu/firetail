<template>
    <div class="queue-item" :class="isActive">
        <!-- i think the images are causing slowdown, either needs tweaks or removal entirely -->
        <div class="image">
            <img v-if="source.hasImage === 1" loading="lazy" :src="getImg(source.albumArtist, source.album)">
            <img v-else src="../../../assets/no_imagealt.svg">
        </div>
        <div class="song-info">
            <span class="title">{{source.title}}</span>
            <span class="artist">{{source.artist}}</span>
        </div>
        <div v-if="isActive === 'active'" class="nowplaying">
            <div class="playing-ani">
                <div class="bar one"></div>
                <div class="bar two"></div>
                <div class="bar three"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['source'],
    methods: {
        getImg(artist, album) {
            const port = this.$store.state.nav.port
            return `http://localhost:${port}/images/${(artist + album).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> {}[\]\\/]/gi, '')}.jpg`
        }
    },
    computed: {
        isActive() {
            if (this.source.id === this.$store.state.audio.currentSong) {
                return "active"
            } else {
                return ""
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.queue-item {
    display: flex;
    align-items: center;
    padding: 12px 12px 0 12px;
    gap: 10px;

    img {
        width: 45px;
        height: 45px;
        background-color: var(--bg);
        border-radius: 2px;
    }

    .song-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 230px;

        .title {
            font-size: 0.95em;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .artist {
            margin-top: 3px;
            font-size: 0.75em;
            opacity: 0.75;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

.queue-item.active {
    color: var(--hl-txt);
}

.nowplaying {
    display: flex;
    width: 45px;
    height: 45px;
    justify-content: center;
    align-items: center;
}

.playing-ani {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 21px;
    height: 15px;
}

.playing-ani .bar {
    min-width: 3px;
    height: 90%;
    background: var(--hl-txt);
    margin: 0 1.5px;
    transition: 0.25s;
    transition-property: transform;
    border-radius: 100px;
    transform: scale(100%);
    transform-origin: bottom;
    will-change: transform;
}

@keyframes barmove {
    from {
        transform: scaleY(15%);
    }
    to {
        transform: scaleY(100%);
    }
}

.playing-ani .bar {
    animation: barmove 0.4s infinite ease-out alternate;
}

.playing-ani .bar.two {
    animation-delay: -0.25s;
}

.playing-ani .bar.one {
    animation-delay: -0.5s;
}
</style>