<script setup lang="ts">
import {onMounted, Ref, ref, watch} from "vue";
import FiretailSong from "../types/FiretailSong";
import Albums from "../types/Albums";
import {useRoute, useRouter} from "vue-router";
import SideList from "../components/SideList.vue";

interface SongsGenre {
  songs: FiretailSong[],
  genres: string[],
  artists: string[],
  sum: number
}

const songList: Ref<FiretailSong[]> = ref([]);
const listLength: Ref<number> = ref(0);
const genres: Ref<string[]> = ref([]);
const artists: Ref<string[]> = ref([]);
const albumList: Ref<Albums[]> = ref([]);
const listName = ref("Albums");
const artistName = ref("Artists");

const route = useRoute();
const router = useRouter();

watch(() => route.params, getNewAlbumData, { immediate: true });

function getNewAlbumData(album: Albums) {
  window.library.getAllFromAlbum(album.album, album.albumArtist).then((songsAndGenres: SongsGenre) => {
    songList.value = songsAndGenres.songs;
    genres.value = songsAndGenres.genres;
    artists.value = songsAndGenres.artists;
    listLength.value = songsAndGenres.sum;
    console.log(artists.value);
  });
  listName.value = album.album;
  artistName.value = album.albumArtist;
}

onMounted(() => {
  window.library.getAllAlbums().then((albums:Albums[]) => {
    albumList.value = albums;
    if (route.params.album) return;
    router.replace(`/albums/${encodeURIComponent(albums[0].albumArtist)}/${encodeURIComponent(albums[0].album)}`);
  })
})
</script>

<template>
  <div class="albums-view-container">
    <SideList :albums="albumList" />
    <div class="song-list-container">
      <RouterView v-slot="{ Component }">
        <component
            :is="Component"
            :song-list="songList"
            :list-length="listLength"
            :list-name="listName"
            :is-simple="true"
            :show-info-view="true"
            :artist-name="artistName"
            :genres="genres"
            :artists="artists"
        />
      </RouterView>
    </div>
  </div>
</template>

<style scoped>
.albums-view-container {
  --song-list-width: 300px;
  --info-view-width: 350px;
}

.song-list-container {
  position: relative;
  left: calc(var(--song-list-width) + 16px);
  width: calc(100% - var(--song-list-width) - 16px);
  height: calc(100vh - 44px - 85px);
  --main-border-radius-element: 0px;
}

@media (max-width: 1350px) {
  .albums-view-container {
    --song-list-width: 79px;
  }
}
</style>