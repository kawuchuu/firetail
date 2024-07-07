<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {audioPlayer} from "../renderer";
import BaseSongView from "../components/songlistviews/BaseSongTop.vue";
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
        <RouterView v-slot="{ Component }" name="top">
          <component :is="Component" list-name="Songs" :list-size="songList.length" />
        </RouterView>
      </template>
      <template #after>
        <RouterView v-slot="{ Component }" name="bottom">
          <component :is="Component" />
        </RouterView>
      </template>
      <template #default="{ item, index, active }">
        <SongListItem :song="item" :index="index" />
      </template>
    </RecycleScroller>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  overflow: hidden;
  position: absolute;
  top: 0;
  width: calc(100%);
  height: 100%;
}

.scroller {
  width: calc(100%);
  height: 100%;
  // padding: 0 20px;
  scrollbar-gutter: stable both-edges;
}
</style>