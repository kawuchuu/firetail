<script setup lang="ts">
import {onMounted, ref, Ref, watch} from "vue";
import SideList from "../components/SideList.vue";
import SideListItem from "../components/SideListItem.vue";
import {useRoute, useRouter} from "vue-router";
import {SongsGenre} from "../types/Common";
import FiretailSong from "../types/FiretailSong";

interface Parameters {
  artist: string;
}

const route = useRoute();
const router = useRouter();

const artists: Ref<string[]> = ref([]);
const songList: Ref<FiretailSong[]> = ref([]);
const listLength: Ref<number> = ref(0);
const listName = ref("Artists");

watch(() => route.params, getNewArtistData, {immediate: true});

function getNewArtistData(artist: Parameters) {
  const songsAndGenres:SongsGenre = window.library.getAllFromArtist(artist.artist);
  songList.value = songsAndGenres.songs;
  listLength.value = songsAndGenres.sum;
  listName.value = artist.artist;
}

onMounted(() => {
  artists.value = window.library.getAllArtists();
  router.replace(`/artists/${encodeURIComponent(artists.value[0])}`);
})
</script>

<template>
  <div class="artists-view-container">
    <SideList>
      <SideListItem v-for="item in artists" :key="item" :title="item" :url="`/artists/${encodeURIComponent(item)}`" />
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
.artists-view-container {
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
  .artists-view-container {
    --info-view-width: 350px;
  }
}

@media (max-width: 1200px) {
  .artists-view-container {
    --info-view-width: 250px;
  }
}

@media (max-width: 1350px) {
  .artists-view-container {
    --song-list-width: 64px;
  }
}
</style>