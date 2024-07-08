<script setup lang="ts">
import {onMounted, Ref, ref, watch} from "vue";
import FiretailSong from "../types/FiretailSong";
import Albums from "../types/Albums";
import {useRoute} from "vue-router";
import SideList from "../components/SideList.vue";

const songList: Ref<FiretailSong[]> = ref([]);
const albumList: Ref<Albums[]> = ref([]);
const listName = ref("Albums");

const route = useRoute();

watch(() => route.params, getNewAlbumData, { immediate: true });

function getNewAlbumData(album: Albums) {
  window.library.getAllFromAlbum(album.album, album.albumArtist).then((allSongs:FiretailSong[]) => {
    songList.value = allSongs;
  });
  listName.value = album.album;
}

onMounted(() => {
  window.library.getAllAlbums().then((albums:Albums[]) => {
    albumList.value = albums;
  })
})
</script>

<template>
  <div class="albums-view-container">
    <SideList :albums="albumList" />
    <div class="song-list-container">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :song-list="songList" :list-name="listName" />
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.albums-view-container {
  --song-list-width: 300px;
}

.song-list-container {
  position: fixed;
  left: calc(var(--song-list-width) + var(--sidebar-width));
  width: calc(100% - var(--song-list-width) - var(--sidebar-width));
  height: calc(100vh - 44px - 85px);
}
</style>