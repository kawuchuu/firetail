<template>
    <div class="item-root">
        <div v-if="$route.path === '/artists'" class="albums-item">
            <router-link :to="`?hideTop=true&column=artist&q=${encodeURIComponent(source.artist)}&view=artist_${encodeURIComponent(source.artist)}`" draggable="false">
                <div class="artist-img"/>
                <span>{{ source.artist }}</span>
            </router-link>
        </div>
        <div v-else-if="$route.path === '/albums'" class="albums-item">
            <router-link :to="`?hideTop=true&column=album&q=${encodeURIComponent(source.album)}&view=album_${encodeURIComponent(source.album)}`" draggable="false">
                <div class="album-img" :style="albumArt"/>
                <span>{{ source.album }}</span>
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    props: ['source'],
    asyncComputed: {
        async albumArt() {
            let port = this.$store.state.nav.port
            if (this.source.hasImage == 1) {
                let artistAlbum = `http://localhost:${port}/images/${(this.source.artist + this.source.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`;
                return `background-image: url('${artistAlbum}')`
            } else {
                return ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.albums-item {
    height: 60px;
    border-radius: 10px;
}

.albums-item a span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    opacity: 0.65;
    padding-right: 10px;
}

.router-link-exact-active {
    background-color: var(--button);
    border-radius: 5px;
    cursor: default;
}

.albums-item a.router-link-exact-active span {
    opacity: 1;
    font-weight: bold;
}

.albums-item a.router-link-exact-active div {
    background-color: var(--bg)
}

.albums-item a {
    display: flex;
    align-items: center;
    height: 100%;
}

.albums-item:hover {
    a span {
        opacity: 1;
    }
}

.album-img, .artist-img {
    min-width: 45px;
    min-height: 45px;
    margin-right: 15px;
    margin-left: 18px;
    background-color: var(--back-bg);
    border-radius: 3px;
    background-image: url('../../assets/no_album.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.artist-img {
    border-radius: 999px;
    background-image: url('../../assets/no_artist.svg')
}

@media (max-width: 1350px) {
    .albums-item a span {
        padding-right: 0px;
    }
}
</style>