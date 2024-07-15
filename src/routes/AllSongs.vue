<script setup lang="ts">
import {onMounted, Ref, ref} from "vue";
import FiretailSong from "../types/FiretailSong";

const songList: Ref<FiretailSong[]> = ref([]);

onMounted(() => {
  window.library.getAllSongs().then((allSongs:FiretailSong[]) => {
    console.log(allSongs);
    songList.value = allSongs;
  });
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" :song-list="songList" :list-name="$t('ROUTER.ALL_SONGS')" />
  </RouterView>
</template>

<style scoped>

</style>