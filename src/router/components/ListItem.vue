<template>
    <div class="item-root">
        <div v-if="$route.path === '/artists'" class="albums-item">
            <router-link :to="`?hideTop=true&column=artist&q=${encodeURIComponent(source.artist)}&view=artist_${encodeURIComponent(source.artist)}`" draggable="false">
                <div class="artist-img"/>
                <span>{{ source.artist }}</span>
            </router-link>
        </div>
        <div v-else-if="$route.path === '/albums'" class="albums-item">
            <router-link :to="`?hideTop=true&column=album&q=${encodeURIComponent(source.album)}&view=album_${encodeURIComponent(source.albumArtist + source.album)}&albumArtist=${encodeURIComponent(source.albumArtist)}`" draggable="false">
                <div class="album-img" :style="albumArt"/>
                <div class="album-info">
                    <span>{{ source.album }}</span>
                    <span class="album-artist">{{ source.albumArtist }}</span>
                </div>
            </router-link>
        </div>
        <div v-else-if="$route.path === '/genres'" class="albums-item">
            <router-link :to="`?hideTop=true&genre=${encodeURIComponent(source.value)}&view=genres_${encodeURIComponent(source.value)}`" draggable="false">
                <div class="genre-img"/>
                <span>{{ source.value }}</span>
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
                let artistAlbum = `http://localhost:${port}/images/${(this.source.albumArtist + this.source.album).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> {}[\]\\/]/gi, '')}.jpg`;
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
    height: 63px;
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
    border-radius: 10px;
    cursor: default;
}

.albums-item a.router-link-exact-active span {
    opacity: 1;
    font-weight: 600;
}

.albums-item a {
    display: flex;
    align-items: center;
    height: 100%;
    border-radius: 10px;
}

.album-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: transparent !important;

    span {
        font-size: 0.95em;
        margin-left: 6px;
    }

    .album-artist {
        font-size: 0.8em;
        margin-top: 5px;
        font-weight: normal !important;
    }
}

.albums-item:hover {
    a span {
        opacity: 1;
    }
}

.album-img, .artist-img, .genre-img {
    min-width: 45px;
    min-height: 45px;
    margin: 0px 9px;
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

.genre-img {
    border-radius: 999px;
    background-image: url('../../assets/no_genre.svg')
}

@media (max-width: 1350px) {
    .albums-item a span {
        padding-right: 0px;
        margin-left: 6px;
    }
    .album-img, .artist-img {
        margin: 0px 9px;
    }
}
</style>