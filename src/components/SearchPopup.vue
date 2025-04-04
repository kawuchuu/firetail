<template>
    <div class="popup search" :class="active">
        <div class="search-inner">
            <div v-if="!results" class="placeholder-search">
                <i class="ft-icon">search</i>
                <span>{{$t('SEARCH.EMPTY_INPUT')}}</span>
            </div>
            <div v-if="results == -1" class="placeholder-search">
                <i class="ft-icon">search</i>
                <span>{{$t('SEARCH.NO_RESULTS')}}</span>
            </div>
            <div v-if="results && results.songs && results.songs.length > 0" class="category songs">
                <div class="heading">{{$t('SEARCH.TITLE.SONG')}}</div>
                <div class="result song" v-for="item in results.songs" :key="item.id">
                    <img v-if="item.hasImage == 1" :src="getImg(item.albumArtist, item.album)">
                    <img v-else src="../assets/no_imagealt.svg">
                    <div class="song-info">
                        <span class="title">{{item.title}}</span>
                        <span class="artist">{{item.artist}}</span>
                    </div>
                </div>
            </div>
            <div v-if="results && results.albums && results.albums.length > 0" class="category albums">
                <div class="heading">{{$t('SEARCH.TITLE.ALBUM')}}</div>
                <router-link v-for="item in results.albums" :key="item.id" :to="`/albums?column=album&q=${encodeURIComponent(item.album)}&view=album_${encodeURIComponent(item.albumArtist + item.album)}&albumArtist=${encodeURIComponent(item.albumArtist)}`">
                    <div class="result album" @click="closeSearch">
                        <img v-if="item.hasImage == 1" :src="getImg(item.albumArtist, item.album)">
                        <img v-else src="../assets/no_album.svg">
                        <div class="song-info">
                            <span class="title">{{item.album}}</span>
                            <span class="artist">{{item.albumArtist}}</span>
                        </div>
                    </div>
                </router-link>
            </div>
            <div v-if="results && results.artists && results.artists.length > 0" class="category artists">
                <div class="heading">{{$t('SEARCH.TITLE.ARTIST')}}</div>
                <router-link v-for="item in results.artists" :key="item.id" :to="`/artists?column=artist&q=${encodeURIComponent(item.artist)}&view=artist_${encodeURIComponent(item.artist)}`">
                    <div class="result artist" @click="closeSearch">
                        <img src="../assets/no_artist.svg">
                        <span>{{ item.artist }}</span>
                    </div>
                </router-link>
            </div>
            <div v-if="results && results.playlists && results.playlists.length > 0" class="category playlists">
                <div class="heading">{{$t('SEARCH.TITLE.PLAYLIST')}}</div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['active', 'results'],
    inject: ['closeSearch'],
    methods: {
        getImg(artist, album) {
            const port = this.$store.state.nav.port
            return `http://localhost:${port}/images/${(artist + album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
        }
    }
}
</script>

<style lang="scss" scoped>
.popup {
    position: fixed;
    width: auto;
    height: 300px;
    background: var(--back-bg);
    border-radius: 10px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    pointer-events: none;
    opacity: 0;
    //transition: .15s;
    border: solid 1px var(--bd);
    transition: 0.2s cubic-bezier(0.17, 0.88, 0.25, 1.1);
    transition-property: transform opacity;
    z-index: 2;
    right: 0px;
}

.popup::before {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: var(--back-bg);
    position: absolute;
    top: -8px;
    left: 44px;
    border: solid 1px var(--bd);
    border-radius: 2px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    z-index: 1;
}

.popup.active {
    opacity: 1;
    transform: translate(-25px, 20px) scale(1) !important;
    pointer-events: all;
}

.popup.search {
    transform: translate(0px, -300px) scale(0);
    width: 350px;
    height: 500px;

    .search-inner {
        width: 100%;
        height: 100%;
        background: var(--back-bg);
        border-radius: 20px;
        position: relative;
        z-index: 2;
        overflow: hidden;
        overflow-y: auto;
    }
}

.rtl {
    .popup {
        left: 0;
    }
    .popup::before {
        right: 72px;
    }
    .popup.search {

    }
    .popup.active {
        transform: translate(40px, 20px) scale(1) !important;
    }
}

.win32 .popup.search {
    transform: translate(-100px, -300px) scale(0) !important;
}

.win32 .popup.active {
    transform: translate(-110px, 20px) scale(1) !important;
}

.win32 .popup::before {
    right: initial;
    left: 18px;
}

.placeholder-search {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    opacity: 0.5;

    i {
        font-size: 5em;
    }

    span {
        margin-top: 10px;
    }
}

.category {
    padding: 15px;

    .heading {
        border-bottom: 1px solid var(--bd);
        padding: 0px 0px 10px 8px;
    }
}

.reduceMotion {
    .popup.search {
        transform: translate(-25px, 20px) !important;
    }
}

.result {
    display: flex;
    align-items: center;
    padding: 8px;
    gap: 10px;

    img {
        width: 45px;
        height: 45px;
        background-color: var(--bg);
    }
}

.result.song, .result.album {
    img {
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

.result.artist {
    img {
        border-radius: 100px;
    }

    span {
        margin-left: 10px;
        font-size: 0.95em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>