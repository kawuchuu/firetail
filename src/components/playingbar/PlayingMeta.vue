<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {audioPlayer} from '../../renderer';
import {getArt} from "../../modules/art";

const imagePath = ref('');

const getImage = computed( () => {
  if (imagePath.value !== '') {
    return `background-image: url(${imagePath.value})`;
  } else return ''
});

async function changeImagePath() {
  if (audioPlayer.currentSong && audioPlayer.currentSong.hasImage === 1) {
    imagePath.value = await getArt(audioPlayer.currentSong.albumArtist, audioPlayer.currentSong.album);
  } else imagePath.value = '';
}

//watch(() => audioPlayer.reactive.title, changeImagePath);
watch(() => audioPlayer.reactive.currentSong, changeImagePath);
</script>

<template>
    <div class="song-info">
        <RouterLink>
            <div class="song-album-art" :style="getImage"></div>
        </RouterLink>
        <div ref="titleArtist" class="title-artist">
            <RouterLink class="song-title">{{audioPlayer.reactive.title}}</RouterLink>
            <RouterLink class="song-artist">{{audioPlayer.reactive.artist}}</RouterLink>
        </div>
        <i class="ft-icon favourite-icon" :class="[isFavourite, isInLibrary]" @click="handleFavourite">{{ favouriteIcon }}</i>
    </div>
</template>

<style scoped>
.song-info {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.title-artist {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 15px;
    -webkit-mask-image: -webkit-linear-gradient(180deg, transparent, #000 20px);
}

.song-album-art {
    min-width: 55px;
    min-height: 55px;
    left: 1px;
    border-radius: 4px;
    z-index: 2;
    position: relative;
    background-image: url('../../assets/no_imagealt.svg');
    background-color: var(--bg);
    background-position: center !important;
    background-size: cover !important;
    transition: .1s;
    outline: solid 1px rgba(255, 255, 255, 0.12);
}

@keyframes scroll {
    0% {
        transform: translateX(0px);
    }
    25% {
        transform: translateX(0px);
    }
    50% {
        transform: translateX(var(--scrollBy));
    }
    75% {
        transform: translateX(var(--scrollBy));
    }
    100% {
        transform: translateX(0px);
    }
}

.song-title {
    --scrollBy: 0px;
    font-size: 15px;
    overflow: hidden;
    line-height: 20px;
    white-space: nowrap;
    width: fit-content;
    font-weight: 600;
    padding-right: 20px;
    margin-bottom: 3px;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    //animation: scroll 15s infinite linear;
}

.song-title:hover, .song-artist:hover {
    text-decoration: underline;
}

.boldText .song-title {
    font-weight: bold;
}

.song-artist {
    margin: 0;
    margin-right: 20px;
    opacity: .75;
    font-size: 12px;
    overflow: hidden;
    line-height: 15px;
}

.favourite-icon {
    font-size: 22px;
    opacity: 0.5;
    margin-left: 12px;
    cursor: pointer;
    border-radius: 100px;
}

.favourite-icon:hover {
    opacity: 0.8;
}

.favourite-icon:active {
    opacity: 0.3;
}

.favourite-icon.active {
    opacity: 1;
    color: var(--hl-txt)
}

.favourite-icon.active:hover {
    opacity: 0.7;
}

.favourite-icon.active:active {
    opacity: 0.5;
}

.favourite-icon.hide {
    display: none;
}

.song-title-fav {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}
</style>