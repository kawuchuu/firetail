<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {onBeforeMount, ref, Ref, watch} from "vue";
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

watch(() => route.params?.id, getPlaylist, {immediate: true});

function getPlaylist() {
  if (route.params.id) playlist.value = window.playlists.getPlaylist(parseInt(route.params.id as string));
  getSongs();
}

function getSongs() {
  if (!playlist.value) return;
  const allSongs:SongsSum = window.playlists.getAllActualSongsFromPlaylist(playlist.value.id);
  songList.value = allSongs.songs;
  listLength.value = allSongs.sum;
}

onBeforeMount(() => {
  getPlaylist();
})
</script>

<template>
  <RouterView v-slot="{ Component }" class="wrapper">
    <component
        :is="Component"
        :song-list="songList"
        :list-length="listLength"
        :list-name="playlist?.name || 'Playlist'"
        :show-info-view="true"
        :description="playlist?.description"
    />
  </RouterView>
</template>

<style scoped lang="scss">
.wrapper {
  --info-view-width: 450px;
  --song-list-width: 0px;
  --padding-compensate: 32px;
}

@media (max-width: 1600px) {
  .wrapper {
    --info-view-width: 350px;
  }
}

@media (max-width: 1200px) {
  .wrapper {
    --info-view-width: 250px;
  }
}
</style>