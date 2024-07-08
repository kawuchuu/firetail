<script setup lang="ts">
import Albums from "../types/Albums";

const props = defineProps<{
  albums: Albums[]
}>();
</script>

<template>
  <div class="side-list-container">
    <div class="list-items" v-for="item in albums" :key="`${item.album}_${item.albumArtist}`">
      <router-link :to="`/albums/${item.albumArtist}/${item.album}`">{{item.album}} - {{item.albumArtist}}</router-link>
    </div>
  </div>
</template>

<style scoped>
.side-list-container {
  position: fixed;
  width: var(--song-list-width);
  height: calc(100% - 85px - 44px);
  overflow: hidden;
  overflow-y: auto;
}
</style>