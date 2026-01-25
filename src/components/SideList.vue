<script setup lang="ts">
import {Albums, AlbumsDB} from "../types/Albums";
import {formatArtPath, getImagePath} from "../modules/art";
import {onMounted, ref} from "vue";
import SideListItem from "./SideListItem.vue";
import {OverlayScrollbarsComponent} from "overlayscrollbars-vue";

const props = defineProps<{
  albums: AlbumsDB[],
  eps: AlbumsDB[],
  singles: AlbumsDB[]
}>();

const path = ref('');

onMounted(() => {
  path.value = getImagePath();
})
</script>

<template>
  <OverlayScrollbarsComponent class="side-list-container" :options="{
      scrollbars: {
        theme: 'os-theme-light',
        autoHide: 'move'
      }
    }">
    <p class="album-category-label" v-if="albums && albums.length > 0"><span>Albums</span></p>
    <SideListItem v-for="item in albums" :key="`${item.title}_${item.albumArtist}`" :item="item" :path="path" />
    <p class="album-category-label" v-if="eps && eps.length > 0"><span>EPs</span></p>
    <SideListItem v-for="item in eps" :key="`${item.title}_${item.albumArtist}`" :item="item" :path="path" />
    <p class="album-category-label" v-if="singles && singles.length > 0"><span>Singles</span></p>
    <SideListItem v-for="item in singles" :key="`${item.title}_${item.albumArtist}`" :item="item" :path="path" />
  </OverlayScrollbarsComponent>
</template>

<style scoped>
.side-list-container {
  position: fixed;
  width: var(--song-list-width);
  height: calc(100% - 85px - 44px - 32px);
  overflow: hidden;

  max-width: 300px;
  z-index: 4;
  padding: 16px;
  background: var(--bg);
  border-right: solid var(--bd) 1px;
  border-radius: var(--main-border-radius);

  transition: 0.3s cubic-bezier(0, 1, 0.35, 1);
  transition-property: width;
  transition-delay: 0.2s;
}

.album-category-label {
  border-bottom: solid 1px var(--bd);
  padding: 0 0 10px 10px;
  margin: 30px 0 10px 0;
  transition: font-size 0.5s cubic-bezier(0, 1, 0.35, 1);
  transition-delay: 0.2s;
  height: 20px;
  display: flex;
  align-items: flex-end;
}

.album-category-label:first-child {
  margin-top: 4px;
}

@media (max-width: 1350px) {
  .side-list-container:hover {
    width: 300px;
  }

  .side-list-container .album-category-label {
    font-size: 0.8em;
  }

  .side-list-container:hover .album-category-label {
    font-size: 1em;
  }

  .side-list-container::-webkit-scrollbar-thumb {
    background: transparent;
    background-clip: content-box;
  }

  .side-list-container:hover::-webkit-scrollbar-thumb {
    background: var(--text-op);
    background-clip: content-box;
  }
}
</style>