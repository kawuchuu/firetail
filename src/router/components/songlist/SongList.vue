<template>
    <div>
        <div class="list-section">
            <i class="material-icons-outlined play-pause" style="visibility: hidden;">play_arrow</i>
            <div class="artist-title-album section">
                <p class="list-title">{{ $t('songList.listTitle') }}</p>
                <p class="list-artist">{{ $t('songList.listArtist') }}</p>
                <p class="list-album">{{ $t('songList.listAlbum') }}</p>
                <p class="list-duration">{{ $t('songList.listDuration') }}</p>
            </div>
        </div>
        <div class="wrapper">
            <SongItem v-for="item in list" :song="item" :key="item.id"/>
        </div>
    </div>
</template>

<script>
import SongItem from './SongItem'
import { mapState } from 'vuex'

export default {
    components: {
        SongItem
    },
    computed: mapState('audio', {
        list: function(state) {
            let thing = state.currentList
            this.$store.commit('audio/updateCurrentList', thing)
            return thing
        }
    })
}
</script>

<style>
.results-link {
    border-bottom: 1px solid var(--bd);
    background: var(--bg);
    overflow: hidden;
    position: relative;
    height: 35px;
    display: flex;
    align-items: center;
    transition: .25s;
    transition-property: margin-left;
}

li:hover {
    background: var(--li-hv);
}

li.nohover:hover {
    background: none;
}

.artist-title-album {
    display: flex;
    width: calc(100% - 30px);
    font-size: 14px;
    align-items: center;
}

.list-title {
    margin: 0;
    margin-left: 14px;
    width: calc(40% - 40px);
    padding-right: 40px !important;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 9px 0;
    pointer-events: none;
    white-space: nowrap;
}

.list-artist,
.list-album,
.list-duration {
    width: calc(30% - 85px);
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 9px 0;
    padding-right: 40px;
    pointer-events: none;
    white-space: nowrap;
}

.list-duration {
    padding-right: 20px;
}

.list-duration {
    width: 85px;
    text-align: right;
}

.list-artist span, .list-album span {
    pointer-events: all;
}

.list-artist span:hover, .list-album span:hover {
    color: var(--hl-txt);
    text-decoration: underline;
    cursor: pointer;
}

.list-artist span:active, .list-album span:active {
    color: var(--hl-txt);
    text-decoration: underline;
    opacity: .8;
}

.play-pause {
    font-size: 24px !important;
    padding: 0;
    padding-left: 7px;
    cursor: pointer;
    opacity: 0;
}

.play-pause:hover {
    opacity: .65 !important;
    color: var(--hl-txt) !important;
    transform: scale(1.2);
}

.results-link.active i {
    opacity: 1;
}

.results-link.active {
    color: var(--hl-txt);
}

.list-section {
    overflow: hidden;
    height: 30px;
    display: flex;
    align-items: center;
    top: 0;
    z-index: 3;
    background: var(--bg);
    text-transform: uppercase;
    letter-spacing: 2px;
    border-bottom: solid 1px var(--bd);
}

.list-section .list-artist:hover, .list-section .list-album:hover, .list-section .list-duration:hover {
    color: var(--text);
    text-decoration: none;
    cursor: default;
    opacity: 1;
}

.list-section .list-artist:active, .list-section .list-album:active, .list-section .list-duration:active {
    color: var(--text);
    text-decoration: none;
    opacity: 1;
}

div.section {
    font-size: 12px;
    opacity: .75;
}
</style>