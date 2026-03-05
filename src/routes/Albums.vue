<script setup lang="ts">
import {onMounted, Ref, ref, watch} from "vue";
import FiretailSong from "../types/FiretailSong";
import {Albums, AlbumsDB} from "../types/Albums";
import {useRoute, useRouter} from "vue-router";
import SideList from "../components/SideList.vue";
import SideListItem from "../components/SideListItem.vue";
import {formatArtPath, getImagePath} from "../modules/art";
import {SongsGenre} from "../types/Common";

interface Parameters {
  album: string;
  albumArtist: string;
}

const songList: Ref<FiretailSong[]> = ref([]);
const listLength: Ref<number> = ref(0);
const genres: Ref<string[]> = ref([]);
const artists: Ref<string[]> = ref([]);
const albumList: Ref<Map<string,AlbumsDB[]>> = ref();
const listName = ref("Albums");
const artistName = ref("Artists");

const regularAlbums: Ref<AlbumsDB[]> = ref();
const eps: Ref<AlbumsDB[]> = ref();
const singles: Ref<AlbumsDB[]> = ref();

const route = useRoute();
const router = useRouter();

const path = ref('');

watch(() => route.params, getNewAlbumData, { immediate: true });

function getNewAlbumData(album: Parameters) {
  const songsAndGenres:SongsGenre = window.library.getAllFromAlbum(album.album, album.albumArtist);
  songList.value = songsAndGenres.songs;
  genres.value = songsAndGenres.genres;
  artists.value = songsAndGenres.artists;
  listLength.value = songsAndGenres.sum;
  console.log(album);
  listName.value = album.album;
  artistName.value = album.albumArtist;
}

function getImage(item: AlbumsDB) {
  console.log('IS IT WORKING')
  if (item.title && item.albumArtist) {
    if (!path.value) path.value = getImagePath();
    const imagePath = formatArtPath(path.value, item.albumArtist, item.title);
    console.log(imagePath);
    return imagePath;
  } else return '';
}

onMounted(() => {
  path.value = getImagePath();
  const albums:Map<string, AlbumsDB[]> = window.library.getAllAlbums();
  albumList.value = albums;
  regularAlbums.value = albums.get('album');
  eps.value = albums.get('ep');
  singles.value = albums.get('single');
  if (route.params.album) return;
  router.replace(`/albums/${encodeURIComponent(albums.get('album')[0].albumArtist)}/${encodeURIComponent(albums.get('album')[0].title)}`);
})
</script>

<template>
  <div class="albums-view-container">
    <SideList>
      <p class="category-label" v-if="regularAlbums && regularAlbums.length > 0"><span>Albums</span></p>
      <SideListItem v-for="item in regularAlbums" :key="`${item.title}_${item.albumArtist}`" :title="item.title" :url="`/albums/${encodeURIComponent(item.albumArtist)}/${encodeURIComponent(item.title)}`" :subtitle="item.albumArtist" :image-path="getImage(item)"/>
      <p class="category-label" v-if="eps && eps.length > 0"><span>EPs</span></p>
      <SideListItem v-for="item in eps" :key="`${item.title}_${item.albumArtist}`" :title="item.title" :url="`/albums/${encodeURIComponent(item.albumArtist)}/${encodeURIComponent(item.title)}`" :subtitle="item.albumArtist" :image-path="getImage(item)"/>
      <p class="category-label" v-if="singles && singles.length > 0"><span>Singles</span></p>
      <SideListItem v-for="item in singles" :key="`${item.title}_${item.albumArtist}`" :title="item.title" :url="`/albums/${encodeURIComponent(item.albumArtist)}/${encodeURIComponent(item.title)}`" :subtitle="item.albumArtist" :image-path="getImage(item)" />
    </SideList>
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
  --info-view-width: 450px;
}

.song-list-container {
  position: relative;
  left: calc(var(--song-list-width) + 32px);
  width: calc(100% - var(--song-list-width) - 32px);
  height: calc(100vh - 44px - 85px);
  --main-border-radius-element: 0px;
}

@media (max-width: 1600px) {
  .albums-view-container {
    --info-view-width: 350px;
  }
}

@media (max-width: 1200px) {
  .albums-view-container {
    --info-view-width: 250px;
  }
}

@media (max-width: 1350px) {
  .albums-view-container {
    --song-list-width: 63px;
  }
}
</style>