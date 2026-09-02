<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {audioPlayer, viewStore} from "../renderer";
import {computed, nextTick, onMounted, provide, ref, watch, Ref, useTemplateRef} from "vue";
import SongListItem from "./SongListItem.vue";
import SongViewInfoView from "./songlistviews/SongViewInfoView.vue";
import {useRoute} from "vue-router";
import {getArt} from "../modules/art";
import ContextMenu from "./ContextMenu.vue";
import {Vector2} from "../types/Common";
import ContextMenuItem from "./ContextMenuItem.vue";

provide('play', play);
provide("closeContextMenu", closeContextMenu);

const props = defineProps<{
  songList: FiretailSong[],
  listLength?: number,
  listName: string,
  isSimple?: boolean,
  showInfoView?: boolean,
  artistName?: string,
  genres?: string[],
  artists?: string[]
}>();

const route = useRoute();

const isSticky = ref(false);
const columnSortInfo = ref(null);
const columnSortWrapper = ref(null);
const topView = ref(null);
const sortInfoOpacity = ref(0);
let opacityToScrollBy = ref(0);
const bgImagePath = ref('');
const isContextMenuVisible = ref(false);
const contextMenuPos:Ref<Vector2> = ref(new Vector2(0, 0));

const highlighted = ref<number[]>([]);
const lastHighlightedIndex = ref<number | null>(null);

const songDragOverlay = useTemplateRef('songDragOverlay');
const songDragOverlayText = ref("Nothing here...");

function isHighlighted(index: number) {
  return highlighted.value.includes(index);
}

function getHighlightClasses(index: number) {
  if (!isHighlighted(index)) return '';
  return {
    highlight: true,
    'highlight-first': !isHighlighted(index - 1),
    'highlight-last': !isHighlighted(index + 1),
  }
}

function getIndexRange(from: number, to: number) {
  const start = Math.min(from, to);
  const end = Math.max(from, to);
  return Array.from({ length: end - start + 1 }, (_, offset) => start + offset);
}

function handleHighlightPointerDown(index: number, evt: PointerEvent) {
  if (evt.shiftKey && lastHighlightedIndex.value !== null) {
    const range = getIndexRange(lastHighlightedIndex.value, index);
    if (evt.ctrlKey) {
      highlighted.value = Array.from(new Set([...highlighted.value, ...range]));
    } else {
      highlighted.value = range;
    }
    return;
  }
  if (evt.ctrlKey) {
    toggleHighlighted(index);
    lastHighlightedIndex.value = index;
    return;
  }
  if (highlighted.value.indexOf(index) != -1) return;
  highlighted.value = [index];
  lastHighlightedIndex.value = index;
}

function handleHighlightPointerUp(index: number, evt: PointerEvent) {
  if (!evt.shiftKey && !evt.ctrlKey) highlighted.value = [index];
}

function play(index:number) {
  audioPlayer.enqueue(props.songList, true, true, index);
}

function closeContextMenu() {
  isContextMenuVisible.value = false;
}

function openContextMenu(item: FiretailSong, evt: PointerEvent) {
  isContextMenuVisible.value = true;
  console.log(item)
  contextMenuPos.value.set(evt.x, evt.y);
}

function toggleHighlighted(index: number) {
  if (highlighted.value.indexOf(index) != -1) {
    highlighted.value.splice(highlighted.value.indexOf(index), 1);
  } else {
    highlighted.value.push(index);
  }
}

function startSongDrag(evt: DragEvent) {
  evt.dataTransfer?.clearData();
  const highlightedSongs = highlighted.value.map(index => props.songList[index]);
  evt.dataTransfer?.setData('firetail/song', JSON.stringify(highlightedSongs));
  songDragOverlayText.value = `${highlightedSongs[0].artist} - ${highlightedSongs[0].title}`;
  if (highlightedSongs.length > 1) songDragOverlayText.value += ` + ${highlightedSongs.length - 1} more`;
  evt.dataTransfer?.setDragImage(songDragOverlay.value as Element, 0, 0);
}

function updateScroll() {
  sortInfoOpacity.value = 1 - (((opacityToScrollBy.value - viewStore.scroll) / opacityToScrollBy.value));
  sortInfoOpacity.value = Math.round((sortInfoOpacity.value - Number.EPSILON) * 100) / 100;
  isSticky.value = sortInfoOpacity.value >= 1;
}

async function updateBackgroundArt() {
  if (route.params.albumArtist && route.params.album) {
    bgImagePath.value = await getArt(route.params.albumArtist, route.params.album);
  } else bgImagePath.value = '';
}

const getImage = computed( () => {
  if (bgImagePath.value !== '') {
    return `background-image: url('${bgImagePath.value}'); filter: blur(25px) saturate(0.7);`;
  } else return ''
});

watch(() => viewStore.scroll, updateScroll);
watch(() => route.params, () => {
  updateBackgroundArt();
  nextTick(() => {
    opacityToScrollBy.value = document.querySelector('.scroll-wrapper').getBoundingClientRect().y - columnSortInfo.value.clientHeight - columnSortWrapper.value.clientHeight - 48;
  })
});

const getColumnSortOffset = computed(() => {
  if (!columnSortInfo.value || !columnSortInfo.value.clientHeight) return 'top: 0'
  return `top: ${columnSortInfo.value.clientHeight + 43}px`;
});

onMounted(() => {
  nextTick(() => {
    opacityToScrollBy.value = document.querySelector('.scroll-wrapper').getBoundingClientRect().y - columnSortInfo.value.clientHeight - columnSortWrapper.value.clientHeight - 48;
  });
  updateBackgroundArt();
})
</script>

<template>
  <div class="wrapper" :class="showInfoView ? 'show-info-view' : ''">
    <teleport to="body">
      <div class="song-drag-overlay" ref="songDragOverlay">
        <p>{{songDragOverlayText}}</p>
      </div>
    </teleport>
    <div class="bg-gradient">
      <div class="list-gradient-fade" />
      <div class="bg-fade-bottom" />
      <div class="bg-art" :style="getImage" />
      <div class="bg-noise" />
      <div class="bg-image" />
    </div>
    <RecycleScroller
        v-if="viewStore.isOverlayScrollInit"
        :items="songList"
        :item-size="isSimple ? 55 : 42"
        :emit-update="true"
        :page-mode="true"
        key-field="id"
        list-class="scroll-wrapper"
        class="scroller"
    >
      <template #before>
        <div class="top-view" ref="topView">
          <RouterView v-slot="{ Component }" name="top">
            <component
                :is="Component"
                :list-name="listName"
                :list-size="songList.length"
                :artist-name="artistName"
                :list-length="listLength"
            />
          </RouterView>
        </div>
        <div class="column-sort-info" ref="columnSortInfo" :style="`opacity: ${sortInfoOpacity}`">
          <h2>{{listName}}</h2>
        </div>
        <div class="column-sort-wrapper" ref="columnSortWrapper" :class="[isSimple ? 'simple' : '', isSticky ? 'sticky' : '']">
          <div class="column-sort" :style="getColumnSortOffset">
            <span class="a">#</span>
            <div class="artist-title-album">
              <span class="list-title">{{$t('SONG_LIST.LIST_TITLE')}}</span>
              <span v-if="!isSimple" class="list-artist">{{$t('SONG_LIST.LIST_ARTIST')}}</span>
              <span v-if="!isSimple" class="list-album">{{$t('SONG_LIST.LIST_ALBUM')}}</span>
              <i class="ft-icon favourite-icon"></i>
              <span class="list-duration"><i class="ft-icon">clock</i></span>
            </div>
          </div>
          <div class="bg" :style="getColumnSortOffset"></div>
        </div>
      </template>
      <template #default="{ item, index, active }" ref="test">
        <SongListItem
            :class="getHighlightClasses(index)"
            :song="item"
            :index="index"
            :is-simple="isSimple"
            @pointerdown.left="handleHighlightPointerDown(index, $event)"
            @pointerup.left="handleHighlightPointerUp(index, $event)"
            @contextmenu="openContextMenu(item, $event)"
            draggable="true"
            @dragstart="startSongDrag"
        />
      </template>
    </RecycleScroller>
    <ContextMenu :top="contextMenuPos.y" :left="contextMenuPos.x" v-if="isContextMenuVisible">
      <ContextMenuItem></ContextMenuItem>
    </ContextMenu>
    <SongViewInfoView v-if="showInfoView" :genres="genres" :artists="artists" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: calc(100% - 32px);
  height: 100%;
  --fixed-width: calc(100vw - var(--sidebar-width));

  padding: 0 16px;

  display: grid;
  grid-template-columns: 1fr;
}

.wrapper.show-info-view {
  grid-template-columns: 1fr 450px;
}

.scroller {
  width: calc(100%);
  height: 100%;
  margin-bottom: 15px;
}

.column-sort-wrapper {
  width: 100%;
  height: 42px;
  margin-bottom: 5px;
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
  border-bottom: solid 1px var(--text-op);

  .artist-title-album {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 20px 0fr;
    align-items: center;
    column-gap: 20px;
    width: calc(100% - 25px);
    font-size: 14px;
  }
}

.column-sort-wrapper.simple .column-sort .artist-title-album {
  grid-template-columns: 3fr 20px 0fr;
}

.column-sort-wrapper.sticky .column-sort {
  position: fixed;
  width: calc(var(--fixed-width) - 46px - var(--song-list-width) - var(--info-view-width));
  pointer-events: none;
  border-color: transparent;
}

.column-sort-wrapper .bg {
  width: calc(var(--fixed-width) - var(--song-list-width));
  height: 42px;
  background: var(--bg);
  border-bottom: solid 1px var(--bd);
  position: fixed;
  right: 0;
  z-index: 1;
  opacity: 0;
  transition: 0.2s;
  transition-property: opacity;
  pointer-events: none;
}

.column-sort-wrapper.sticky .bg {
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
  transition: 100ms;
  transition-property: opacity;

  h2 {
    margin: 15px 75px;
  }
}

html.boldText .column-sort-info h2 {
  font-weight: 800;
}

.list-duration {
  min-width: 40px;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.list-duration i, .disc-num {
  font-size: 20px;
  padding: 0 6px;
}

.bg-gradient {
  position: absolute;
  width: 100%;
  height: 600px;
  top: 0;
  left: 0;
  z-index: -1;
}

.bg-art {
  position: absolute;
  width: 100%;
  height: 420px;
  max-height: 420px;
  background-position: center;
  background-size: 100%;
  background-repeat: no-repeat;
  top: 0;
  z-index: -1;
  overflow: hidden;
  mix-blend-mode: color;
  transition: 0.5s linear;
  transition-property: background-image;
  animation: fadeIn 2s;
}

.list-gradient-fade {
  width: 100%;
  height: 600px;
  position: absolute;
}

.bg-fade-bottom {
  width: 100%;
  height: 200px;
  background: var(--bg);
  position: absolute;
  top: 420px;
  z-index: 2;
}

.song-drag-overlay {
  max-width: 256px;
  padding: 12px 14px;
  background: var(--fg-bg);
  border-radius: 10px;
  border: solid 1px var(--bd);
  position: absolute;
  right: 0;
  top: 50%;
  z-index: -1;

  p {
    margin: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bg-image {
  width: 100%;
  height: 100%;
  max-height: 420px;
  //background: linear-gradient(transparent, transparent, var(--bg)), radial-gradient(circle at top, transparent 40%, var(--bg)), url('../assets/songs-banner-new.png');
  background-image: url('../assets/songs-banner-new.png');
  background-size: cover;
  background-position: top 80%;
  z-index: -2;
  position: absolute;
}

@media (max-width: 1600px) {
  .wrapper {
    --info-view-width: 350px;
  }
  .wrapper.show-info-view {
    grid-template-columns: 1fr 350px;
  }
}

@media (max-width: 1200px) {
  .wrapper {
    --info-view-width: 250px;
  }
  .wrapper.show-info-view {
    grid-template-columns: 1fr 250px;
  }
}
</style>