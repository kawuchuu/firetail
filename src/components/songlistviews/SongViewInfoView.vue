<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {getArt} from "../../modules/art";
import {audioPlayer} from "../../renderer";

const route = useRoute();
const imagePath = ref('../../assets/no_album.svg');

async function updateAlbumArt() {
  if (route.params.album && route.params.albumArtist) {
    imagePath.value = await getArt(route.params.albumArtist, route.params.album);
  } else imagePath.value = '../../assets/no_album.svg';
}

watch(() => route.params, updateAlbumArt);

onMounted(() => {
  updateAlbumArt();
})
</script>

<template>
  <div class="info-view">
    <div class="album-art">
      <img :src="imagePath" alt="Album art"/>
    </div>
  </div>
</template>

<style scoped>
.info-view {
  width: 100%;
  height: 100%;
}

.album-art {
  width: auto;
  height: auto;
  padding: 40px;

  img {
    background: var(--back-bg);
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
}
</style>