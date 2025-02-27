<script setup lang="ts">
import {onMounted, Ref, ref} from "vue";
import FiretailSong from "../types/FiretailSong";

const songList: Ref<FiretailSong[]> = ref([]);
const listLength = ref(0);

interface SongsSum {
  songs: FiretailSong[],
  sum: number
}

function getSongs() {
  const allSongs:SongsSum = window.library.getAllSongs();
  songList.value = allSongs.songs;
  listLength.value = allSongs.sum;
}

onMounted(() => {
  getSongs();
  window.library.onRefreshView(getSongs);
});
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :song-list="songList" :list-length="listLength" :list-name="$t('ROUTER.ALL_SONGS')" />
  </RouterView>
</template>

<style scoped>

</style>