<script setup lang="ts">
import {onBeforeMount, Ref, ref} from "vue";
import {Playlist} from "../../types/Common";

const playlists: Ref<Playlist[]> = ref([]);

function songDragOver(evt: DragEvent) {
  evt.preventDefault();
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'copy';
  }
}

function songDragEnd(evt: DragEvent) {
  evt.preventDefault();
  console.log(evt.dataTransfer?.getData('firetail/song'));
}

onBeforeMount(() => {
  playlists.value = window.playlists.getAllPlaylists();
})
</script>

<template>
  <router-link v-for="item in playlists" :key="item.id" to="/playlist" draggable="true" @dragover="songDragOver" @drop="songDragEnd">
    <div class="playlist-item inner-outline">
      <i class="ft-icon">queue</i>
      <span>{{item.name}}</span>
    </div>
  </router-link>
</template>

<style scoped lang="scss">
.playlist-item {
  display: flex;
  width: 100%;
  height: 32px;
  align-items: center;
  opacity: 0.75;
  border-radius: 10px;
  background: transparent;
  transition: 0.1s;
  transition-property: background;
  position: relative;

  i {
    margin: 0 12px;
    pointer-events: none;
    font-size: 20px;
  }

  span {
    font-size: 14px;
  }
}

.playlist-item:hover {
  opacity: 1;
}

.router-link-active .playlist-item {
  background: var(--button);
  opacity: 1;
  font-weight: 600;
}

.playlist-item::after {
  opacity: 0;
}

.router-link-active .playlist-item::after {
  border-radius: 10px;
  opacity: 1;
}
</style>