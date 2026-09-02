<script setup lang="ts">
import FiretailSong from "src/types/FiretailSong";
import {onBeforeMount, ref, Ref} from "vue";
import {useRoute} from "vue-router";
import {Playlist, SongsGenre} from "../types/Common";

const route = useRoute();

const songList: Ref<FiretailSong[]> = ref([]);
const listLength = ref(0);
const playlist: Ref<Playlist | null> = ref(null);

interface SongsSum {
  songs: FiretailSong[],
  sum: number
}

function getSongs() {
  if (!playlist.value) return;
  const allSongs = window.playlists.getAllActualSongsFromPlaylist(playlist.value.id);
  console.log(allSongs);
  songList.value = allSongs;
}

onBeforeMount(() => {
  if (route.params.id) playlist.value = window.playlists.getPlaylist(parseInt(route.params.id as string));
  console.log(playlist.value);
  getSongs();
})
</script>

<template>
  <RouterView v-slot="{ Component }" class="wrapper">
    <component :is="Component" :song-list="songList" :list-length="listLength" :list-name="playlist?.name || 'Playlist'" />
  </RouterView>
</template>

<style scoped lang="scss">
.wrapper {
  --info-view-width: -16px;
}
</style>