<script setup lang="ts">
import {Albums, AlbumsDB} from "../types/Albums";
import {formatArtPath, getImagePath} from "../modules/art";
import {onMounted, ref} from "vue";
import SideListItem from "./SideListItem.vue";

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
  <div class="side-list-container">
    <p class="album-category-label"><span>Albums</span></p>
    <SideListItem v-for="item in albums" :key="`${item.title}_${item.albumArtist}`" :item="item" :path="path" />
    <p class="album-category-label"><span>EPs</span></p>
    <SideListItem v-for="item in eps" :key="`${item.title}_${item.albumArtist}`" :item="item" :path="path" />
    <p class="album-category-label"><span>Singles</span></p>
    <SideListItem v-for="item in singles" :key="`${item.title}_${item.albumArtist}`" :item="item" :path="path" />
  </div>
</template>

<style scoped>
.side-list-container {
  position: fixed;
  width: var(--song-list-width);
  height: calc(100% - 85px - 44px - 32px);
  overflow: hidden;
  overflow-y: auto;

  max-width: 300px;
  z-index: 4;
  padding: 16px 0 16px 16px;
  background: var(--bg);
  border-right: solid var(--bd) 1px;
  border-radius: var(--main-border-radius);

  transition: 0.3s cubic-bezier(0, 1, 0.35, 1);
  transition-property: width;
}

.album-category-label {
  border-bottom: solid 1px var(--bd);
  padding: 0 0 10px 10px;
  margin: 30px 0 10px 0;
  transition: font-size 0.5s cubic-bezier(0, 1, 0.35, 1);
  height: 20px;
  display: flex;
  align-items: flex-end;
}

.album-category-label:first-child {
  margin-top: 10px;
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