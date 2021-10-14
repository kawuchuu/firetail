<template>
    <div class="albums-item">
        <router-link :to="`?hideTop=true&column=album&q=${encodeURIComponent(album.album)}&view=album_${encodeURIComponent(album.album)}`">
            <div class="album-img" :style="albumArt"/>
            <span>{{ album.album }}</span>
        </router-link>
    </div>
</template>

<script>
export default {
    props: ['album'],
    asyncComputed: {
        async albumArt() {
            let port = this.$store.state.nav.port
            if (this.album.hasImage == 1) {
                let artistAlbum = `http://localhost:${port}/${(this.album.artist + this.album.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`;
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
    background-color: #322d47;
    color: #ffffff;
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

.album-img {
    min-width: 45px;
    min-height: 45px;
    margin: 0px 15px;
    background-color: #1e1e1ebe;
    border-radius: 3px;
    background-image: url('../../assets/no_album.svg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

@media (max-width: 1350px) {
    .albums-item a span {
        padding-right: 0px;
    }
}
</style>