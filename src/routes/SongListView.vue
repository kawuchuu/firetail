<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {audioPlayer} from "../renderer";
import BaseSongView from "./BaseSongView.vue";
import {onMounted, provide, Ref, ref} from "vue";
import SongListItem from "../components/SongListItem.vue";

let songList = ref<FiretailSong[]>([]);

function play(index:number) {
  console.log(index);
  audioPlayer.enqueue(songList.value, true, true, index);
}

provide('play', play);

onMounted(() => {
  window.library.getAllSongs().then((allSongs:FiretailSong[]) => {
    console.log(allSongs);
    songList.value = allSongs;
  })
})
</script>

<template>
  <div class="wrapper">
    <RecycleScroller
        :items="songList"
        :item-size="42"
        :emit-update="true"
        key-field="id"
        class="scroller"
    >
      <template #before>
        <RouterView v-slot="{ Component }">
          <component :is="Component" is-top-or-bottom="top"/>
        </RouterView>
      </template>
      <template #after>
        <RouterView v-slot="{ Component }">
          <component :is="Component" is-top-or-bottom="bottom"/>
        </RouterView>
      </template>
      <template #default="{ item, index, active }">
        <SongListItem :song="item" :index="index" />
      </template>
    </RecycleScroller>
  </div>
</template>

<style scoped>
.wrapper {
  overflow: hidden;
  position: absolute;
  top: 0;
  width: calc(100%);
  height: 100%;
}

.scroller {
  width: calc(100% - 40px);
  height: 100%;
  padding: 0 20px;
}
</style>