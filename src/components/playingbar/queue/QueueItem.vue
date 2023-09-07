<template>
    <div class="queue-item">
        <img v-if="source.hasImage == 1" :src="getImg(source.albumArtist, source.album)">
        <img v-else src="../../../assets/no_image.svg">
        <div class="song-info">
            <span class="title">{{source.title}}</span>
            <span class="artist">{{source.artist}}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['source'],
    methods: {
        getImg(artist, album) {
            const port = this.$store.state.nav.port
            return `http://localhost:${port}/images/${encodeURIComponent(artist + album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
        }
    }
}
</script>

<style lang="scss" scoped>
.queue-item {
    display: flex;
    align-items: center;
    padding: 12px 12px 6px 12px;

    img {
        width: 45px;
        height: 45px;
        background-color: var(--bg);
        border-radius: 2px;
    }

    .song-info {
        margin-left: 10px;
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
</style>