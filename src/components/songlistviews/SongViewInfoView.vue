<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {getArt} from "../../modules/art";
import {audioPlayer} from "../../renderer";

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
})
</script>

<template>
  <div class="info-view">
    <div class="album-art">
      <img :src="imagePath" alt="Album art"/>
    </div>
    <p class="subtitle">Genres</p>
    <div class="genres">
      <span v-for="item in genres" :key="item">{{item.genre}}</span>
    </div>
    <p class="subtitle">Artists</p>
    <div class="artists">
      <span v-for="item in artists" :key="item"><img src="../../assets/no_artist.svg">{{item.artist}}</span>
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
  padding: 40px 40px 0;

  img {
    background: var(--back-bg);
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
}

.subtitle {
  margin: 10px 0 0 40px;
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

  span {
    padding: 0 16px 0 3px;
    background: var(--fg-bg);
    border-radius: 200px;
    height: 30px;
    display: flex;
    align-items: center;

    img {
      width: 25px;
      height: 25px;
      background: var(--bg);
      border-radius: 200px;
      margin-right: 6px;
    }
  }
}
</style>