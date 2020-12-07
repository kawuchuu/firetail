<template>
    <div class="root">
        <div class="bg-gradient"></div>
        <div class="sticky-bg" ref="stickyBg" :class="currentScroll">
            <div class="bg-inner">
                <h3>All Songs</h3>
            </div>
        </div>
        <div class="top-title" ref="topTitle">
            <div class="tab-album-art"></div>
            <div>
                <h1>All Songs</h1>
                <p>{{ screenCountNum }} songs</p>
            </div>
        </div>
        <div class="root-wrapper">
            <!-- <div class="list-gradient-fade"></div> -->
            <div class="list-section" :class="currentScroll">
                <i class="material-icons-outlined play-pause" style="visibility: hidden;">play_arrow</i>
                <i class="material-icons-outlined favourite-icon" style="visibility: hidden">favorite_border</i>
                <div class="artist-title-album section">
                    <p class="list-title">{{ $t('songList.listTitle') }}</p>
                    <p class="list-artist">{{ $t('songList.listArtist') }}</p>
                    <p class="list-album">{{ $t('songList.listAlbum') }}</p>
                    <p class="list-duration"><i class="material-icons-outlined">schedule</i></p>
                </div>
                <div class="sec-border"></div>
            </div>
            <div class="wrapper">
                <SongItem v-for="item in list" :song="item" :key="item.id"/>
            </div>
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
    computed: {
        ...mapState('audio', {
            list: function(state) {
                return state.currentList
            }
        }),
        ...mapState('nav', {
            screenCountNum: state => state.screenCountNum,
            currentScroll: state => {
                if (state.scrolled > 200) {
                    return 'sticky'
                } else {
                    return ''
                }
            }
        })
    }
}
</script>

<style lang="scss" scoped>
$currentGradColour: $hl-txt;
$subColour: desaturate(darken($currentGradColour, 25%), 40%);

.wrapper {
    padding: 5px 20px;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    background: linear-gradient($currentGradColour, transparent);
    top: 0;
    z-index: -1;
}

.list-gradient-fade {
    width: 100%;
    height: 300px;
    position: absolute;
    background: linear-gradient(hsla(0, 0%, 7%, 0.2), var(--bg));
}

.artist-title-album {
    display: flex;
    width: calc(100% - 72px);
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
    width: calc(30% - 77px);
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 9px 0;
    padding-right: 40px;
    pointer-events: none;
    white-space: nowrap;
}

.list-duration i {
    font-size: 18px;
    padding: 0 6px;
}

.list-duration {
    width: 40px;
    text-align: right;
    padding-right: 20px;
}

.list-section {
    overflow: hidden;
    height: 30px;
    display: flex;
    align-items: center;
    top: 0;
    z-index: 3;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: solid 1px #ffffff3f;
    position: sticky;
    margin-bottom: 5px;
    margin: 0px 20px;
}

.list-section.sticky {
    margin: 0;
    padding: 0px 20px;
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

.favourite-icon {
    font-size: 20px;
    cursor: pointer;
}

.play-pause {
    font-size: 24px !important;
    padding: 0;
    cursor: pointer;
    opacity: 0;
}

.results-link i, .list-section i {
    padding: 0 7px;
}

.top-title {
    padding: 50px 70px;
    display: flex;
    align-items: center;
    //background: linear-gradient(#e74e8e, #e74e8ea6)
}

.top-title h1 {
    font-size: 64px;
    margin: 0;
    letter-spacing: -2px;
}

.top-title p {
    margin: 0px;
    margin-top: 5px;
    opacity: .75;
}

.sticky-bg {
    position: fixed;
    top: 0;
    height: 81px;
    width: 100%;
    background: $subColour;
    z-index: 3;
    opacity: 0;
    transition: 0.15s;
    transition-property: opacity;

    .bg-inner {
        height: 50px;
        display: flex;
        align-items: center;

        h3 {
            margin: 0 70px;
            font-size: 24px;
            letter-spacing: -1px;
        }
    }
}

.sticky-bg.sticky {
    opacity: 1;
}
</style>