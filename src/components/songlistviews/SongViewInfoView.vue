<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import {getArt} from "../../modules/art";
import {audioPlayer} from "../../renderer";

const route = useRoute();
const imagePath = ref('../../assets/no_album.svg');

const props = defineProps<{
  genres: Object[]
}>();

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
    <div class="genres">
      <span v-for="item in genres" :key="item">{{item.genre}}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.info-view {
  width: 100%;
  height: 100%;
}

.album-art {
  width: auto;
  height: auto;
  padding: 40px 40px 20px;

  img {
    background: var(--back-bg);
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
}

.genres {
  display: flex;
  align-items: center;
  padding: 0px 40px;
  gap: 10px;

  span {
    padding: 6px 12px;
    background: var(--fg-bg);
    border-radius: 200px;
  }
}
</style>