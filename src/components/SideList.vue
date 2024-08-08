<script setup lang="ts">
import Albums from "../types/Albums";

const props = defineProps<{
  albums: Albums[]
}>();

function getImage(item: Albums) {
  if (item.album && item.albumArtist) {
    return ``
  }
}
</script>

<template>
  <div class="side-list-container">
    <div class="list-items" v-for="item in albums" :key="`${item.album}_${item.albumArtist}`">
      <router-link :to="`/albums/${encodeURIComponent(item.albumArtist)}/${encodeURIComponent(item.album)}`">
        <div class="item-img" :style="getImage(item)"/>
        <div class="item-info">
          <span>{{ item.album }}</span>
          <span class="album-artist">{{ item.albumArtist }}</span>
        </div>
      </router-link>
    </div>
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

.list-items {
  height: 63px;
  border-radius: 10px;
}

.list-items a span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.65;
  padding-right: 10px;
}

.router-link-exact-active {
  background-color: var(--button);
  border-radius: 10px;
  cursor: default;
}

.list-items a.router-link-exact-active span {
  opacity: 1;
  font-weight: 600;
}

.list-items a {
  display: flex;
  align-items: center;
  height: 100%;
  border-radius: 10px;
}

.item-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: transparent !important;

  span {
    font-size: 0.95em;
    margin-left: 6px;
  }

  .album-artist {
    font-size: 0.8em;
    margin-top: 5px;
    font-weight: normal !important;
  }
}

.list-items:hover {
  a span {
    opacity: 1;
  }
}

.item-img {
  min-width: 45px;
  min-height: 45px;
  margin: 0px 9px;
  background-color: var(--back-bg);
  border-radius: 3px;
  background-image: url('../assets/no_album.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

@media (max-width: 1350px) {
  .side-list-container:hover {
    width: 300px;
  }
}
</style>