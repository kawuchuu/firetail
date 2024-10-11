<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {getArt} from "../../modules/art";
import {audioPlayer, viewStore} from "../../renderer";

const route = useRoute();
const imagePath = ref('../../assets/no_album.svg');

const props = defineProps<{
  genres: Object[],
  artists: Object[],
}>();

async function updateAlbumArt() {
  if (route.params.album && route.params.albumArtist) {
    imagePath.value = await getArt(route.params.albumArtist, route.params.album);
  } else imagePath.value = '../../assets/no_album.svg';
}

watch(() => route.params, updateAlbumArt);

onMounted(() => {
  updateAlbumArt();
  console.log(props.artists);
  console.log(viewStore.defaultImagePath);
})
</script>

<template>
  <div class="info-view">
    <div class="album-art">
      <img :src="imagePath" alt="Album art"/>
    </div>
    <p v-if="genres && genres.length > 0" class="subtitle">Genres</p>
    <div v-if="genres && genres.length > 0" class="genres">
      <span v-for="item in genres" :key="item">{{item.genre}}</span>
    </div>
    <p v-if="artists && artists.length > 0" class="subtitle">Artists</p>
    <div v-if="artists && artists.length > 0" class="artists">
      <div v-for="item in artists" :key="item"><img src="../../assets/no_artist.svg"><span>{{item.artist}}</span></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.info-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.album-art {
  width: auto;
  height: auto;
  padding: 40px 24px 0 40px;

  img {
    background: var(--back-bg);
    width: 100%;
    height: 100%;
    border-radius: 10px;
    box-shadow: 0 0 80px var(--bg-op);
  }
}

.subtitle {
  margin: 10px 0 -10px 40px;
  font-size: 0.9em;
  opacity: 0.75;
}

.genres {
  display: flex;
  align-items: center;
  padding: 0 40px;
  gap: 10px;
  flex-wrap: wrap;

  span {
    padding: 6px 12px;
    background: var(--fg-bg);
    border-radius: 200px;
  }
}

.artists {
  display: flex;
  padding: 0 40px;
  gap: 10px;
  flex-wrap: wrap;

  div {
    padding: 0 12px 0 4px;
    background: var(--fg-bg);
    border-radius: 200px;
    height: 30px;
    display: flex;
    align-items: center;
    overflow: hidden;

    img {
      width: 23px;
      height: 23px;
      background: var(--bg);
      border-radius: 200px;
      margin-right: 6px;
    }

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>