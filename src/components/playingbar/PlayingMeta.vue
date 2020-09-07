<template>
    <div class="song-info">
        <div class="song-album-art"></div>
        <div class="title-artist">
            <div class="song-title">{{title}}</div>
            <div class="song-artist">{{artist}}</div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
    computed: {
        ...mapState('audio', {
            title: state => state.songTitle,
            artist: state => state.songArtist
        })
    }
}
</script>

<style scoped>
.song-info {
    display: flex;
    align-items: center;
    height: 100%;
    width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0px 15px;
}

.title-artist {
    overflow: hidden;
}

.song-album-art {
    min-width: 55px;
    min-height: 55px;
    margin-right: 15px;
    left: 0;
    border-radius: 3px;
    z-index: 2;
    background-image: url('../../assets/no_image.svg');
    background-color: var(--bg);
    background-position: center !important;
    background-size: cover !important;
    transition: .1s;
}

.song-title {
    font-size: 15px;
    font-family: 'Inter', 'Overpass', sans-serif;
    margin-bottom: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    line-height: 20px;
    white-space: nowrap;
    max-width: 350px;
    font-weight: bold
}

.song-artist {
    margin: 0;
    opacity: .75;
    font-size: 12px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 15px;
}
</style>