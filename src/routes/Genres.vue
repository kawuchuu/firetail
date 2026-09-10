<script setup lang="ts">
import {onMounted, ref, Ref, watch} from "vue";
import SideList from "../components/SideList.vue";
import SideListItem from "../components/SideListItem.vue";
import {useRoute, useRouter} from "vue-router";
import FiretailSong from "../types/FiretailSong";

interface Parameters {
  genre: string;
}

interface SongsSum {
  songs: FiretailSong[],
  sum: number
}

const route = useRoute();
const router = useRouter();

const genres: Ref<string[]> = ref([]);
const songList: Ref<FiretailSong[]> = ref([]);
const listLength: Ref<number> = ref(0);
const listName = ref("Artists");

watch(() => route.params, getNewArtistData, {immediate: true});

function getNewArtistData(genre: Parameters) {
  const songs:SongsSum = window.library.getSongsFromGenre(genre.value);
  songList.value = songs.songs;
  listLength.value = songs.sum;
  listName.value = genre.value;
}

onMounted(() => {
  genres.value = window.library.getGenres();
  router.replace(`/genres/${encodeURIComponent(genres.value[0].value)}`);
})
</script>

<template>
  <div class="genres-view-container">
    <SideList>
      <SideListItem v-for="item in genres" :key="item" :title="item.value" :circleImage="true" :url="`/genres/${encodeURIComponent(item.value)}`" />
    </SideList>
    <div class="song-list-container">
      <RouterView v-slot="{ Component }">
        <component
          :is="Component"
          :song-list="songList"
          :list-length="listLength"
          :list-name="listName"
        />
      </RouterView>
    </div>
  </div>
</template>

<style scoped lang="scss">
.genres-view-container {
  --song-list-width: 300px;
  --info-view-width: 0px;
}

.song-list-container {
  position: relative;
  left: calc(var(--song-list-width) + 32px);
  width: calc(100% - var(--song-list-width) - 32px);
  height: calc(100vh - 44px - 85px);
  --main-border-radius-element: 0px;
}

@media (max-width: 1600px) {
  .genres-view-container {
    --info-view-width: 350px;
  }
}

@media (max-width: 1200px) {
  .genres-view-container {
    --info-view-width: 250px;
  }
}

@media (max-width: 1350px) {
  .genres-view-container {
    --song-list-width: 63px;
  }
}
</style>