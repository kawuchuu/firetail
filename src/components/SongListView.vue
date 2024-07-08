<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {audioPlayer} from "../renderer";
import BaseSongView from "./songlistviews/BaseSongTop.vue";
import {computed, nextTick, onMounted, provide, Ref, ref} from "vue";
import SongListItem from "./SongListItem.vue";

provide('play', play);

const props = defineProps<{
  songList: FiretailSong[],
  listName: String
}>();

const isSticky = ref(false);
const columnSortInfo = ref(null);
const sortInfoOpacity = ref(0);
let opacityToScrollBy = ref(0);

function play(index:number) {
  console.log(index);
  audioPlayer.enqueue(props.songList, true, true, index);
}

function updateScroll(evt:Event) {
  const scrollWrapperPos = document.querySelector('.scroll-wrapper').getBoundingClientRect().y;
  isSticky.value = scrollWrapperPos < columnSortInfo.value.clientHeight + 86;
  const actualScrollBy = opacityToScrollBy.value - 80;
  sortInfoOpacity.value = 1 - (((actualScrollBy - (evt.target as HTMLElement).scrollTop + 80) / actualScrollBy));
}

const getColumnSortOffset = computed(() => {
  if (!columnSortInfo.value || !columnSortInfo.value.clientHeight) return 'top: 0'
  return `top: ${columnSortInfo.value.clientHeight + 44}px`;
});

onMounted(() => {
  nextTick(() => {
    opacityToScrollBy.value = document.querySelector('.scroll-wrapper').getBoundingClientRect().y - columnSortInfo.value.clientHeight;
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
        list-class="scroll-wrapper"
        class="scroller"
        @scroll="updateScroll"
    >
      <template #before>
        <RouterView v-slot="{ Component }" name="top">
          <component :is="Component" :list-name="listName" :list-size="songList.length" />
        </RouterView>
        <div class="column-sort-info" ref="columnSortInfo" :style="`opacity: ${sortInfoOpacity}`">
          <h2>{{listName}}</h2>
        </div>
        <div class="column-sort-wrapper">
          <div class="column-sort" :class="isSticky ? 'sticky' : ''" :style="getColumnSortOffset">
            <i class="ft-icon play-pause"></i>
            <div class="artist-title-album">
              <div class="list-title">Title</div>
              <div class="list-artist">Artist</div>
              <p>Album</p>
              <i class="ft-icon favourite-icon">heart</i>
              <i class="ft-icon list-duration">clock</i>
            </div>
            <div class="bg"></div>
          </div>
        </div>
      </template>
<!--      <template #after>
        <RouterView v-slot="{ Component }" name="bottom">
          <component :is="Component" />
        </RouterView>
      </template>-->
      <template #default="{ item, index, active }" ref="test">
        <SongListItem :song="item" :index="index" />
      </template>
    </RecycleScroller>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: calc(100%);
  height: 100%;
  --fixed-width: calc(100vw - var(--sidebar-width) - 16px);
}

.scroller {
  width: calc(100%);
  height: 100%;
  // padding: 0 20px;
  scrollbar-gutter: stable both-edges;
}

.column-sort-wrapper {
  width: 100%;
  height: 42px;
}

.column-sort {
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  column-gap: 5px;
  justify-items: center;
  position: sticky;
  top: 44px;
  height: 42px;
  z-index: 3;
  border-bottom: solid 1px var(--bd);

  .artist-title-album {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 20px 0fr;
    align-items: center;
    column-gap: 20px;
    width: calc(100% - 25px);
    font-size: 14px;
  }
}

.column-sort.sticky {
  position: fixed;
  width: calc(var(--fixed-width) - 16px - var(--song-list-width));
  pointer-events: none;
}

.column-sort .bg {
  width: calc(var(--fixed-width) - var(--song-list-width));
  height: 42px;
  background: var(--bg);
  border-bottom: solid 1px var(--bd);
  position: absolute;
  right: 0;
  z-index: -1;
  opacity: 0;
  transition: 0.2s;
  transition-property: opacity;
}

.column-sort.sticky .bg {
  opacity: 1;
}

.column-sort-info {
  position: fixed;
  width: calc(var(--fixed-width) - var(--song-list-width));
  transform: translateX(-16px);
  top: 44px;
  background: var(--fg-bg);
  z-index: 2;
  border-radius: var(--main-border-radius-element);
  pointer-events: none;

  h2 {
    margin: 15px 76px;
  }
}

.list-duration {
  min-width: 40px;
}
</style>