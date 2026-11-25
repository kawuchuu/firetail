<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {audioPlayer, viewStore} from "../renderer";
import {computed, onBeforeUnmount, onMounted, provide, ref, watch, Ref, useTemplateRef} from "vue";
import SongListItem from "./SongListItem.vue";
import SongViewInfoView from "./songlistviews/SongViewInfoView.vue";
import {useRoute, useRouter} from "vue-router";
import {getArt} from "../modules/art";
import ContextMenu from "./ContextMenu.vue";
import {ContextMenuItemType, Vector2} from "../types/Common";
import ContextMenuItem from "./ContextMenuItem.vue";
import SongInfoModal from "./modals/SongInfoModal.vue";

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
  artists?: string[],
  description?: string,
}>();

const route = useRoute();
const router = useRouter();

const isSticky = ref(false);
const listHeader = useTemplateRef<HTMLElement>('listHeader');
const stickySentinel = useTemplateRef<HTMLElement>('stickySentinel');
let stickyObserver: IntersectionObserver | null = null;
const bgImagePath = ref('');
const isContextMenuVisible = ref(false);
const contextMenuPos:Ref<Vector2> = ref(new Vector2(0, 0));

const highlighted = ref<number[]>([]);
const lastHighlightedIndex = ref<number | null>(null);

const artistContextName = ref('Unknown');
const showSongInfo = ref(false);
const songInfoTarget = ref<FiretailSong | null>(null);

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
  artistContextName.value = item.artist;
  const highlightedSongs = highlighted.value.map(index => props.songList[index]);
  if (highlightedSongs.indexOf(item) == -1) {
    const thisIndex = props.songList.indexOf(item);
    highlighted.value = [thisIndex];
    lastHighlightedIndex.value = thisIndex;
  }
  contextMenuPos.value.set(evt.x, evt.y);
}

function openSongInfo() {
  const song = props.songList[highlighted.value[0]];
  closeContextMenu();
  if (!song) return;
  songInfoTarget.value = song;
  showSongInfo.value = true;
}

function revealHighlighted() {
  const song = props.songList[highlighted.value[0]];
  closeContextMenu();
  if (song) window.library.revealSong(song.id);
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

function observeSticky() {
  stickyObserver?.disconnect();
  const sentinel = stickySentinel.value;
  const header = listHeader.value;
  if (!sentinel || !header) return;
  const stickyTop = parseFloat(getComputedStyle(header).top) || 0;
  stickyObserver = new IntersectionObserver(([entry]) => {
    const rootTop = entry.rootBounds?.top ?? 0;
    isSticky.value = !entry.isIntersecting && entry.boundingClientRect.top < rootTop;
  }, {
    root: sentinel.closest<HTMLElement>('[data-overlayscrollbars-viewport]'),
    rootMargin: `-${stickyTop}px 0px 0px 0px`,
  });
  stickyObserver.observe(sentinel);
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

watch(() => route.params, updateBackgroundArt);

onMounted(() => {
  observeSticky();
  updateBackgroundArt();
});

onBeforeUnmount(() => stickyObserver?.disconnect());
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
    <div class="list-column">
      <div class="top-view">
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
      <div ref="stickySentinel" class="sticky-sentinel" />
      <div ref="listHeader" class="list-header" :class="{stuck: isSticky, simple: isSimple}">
        <div class="list-header-title" aria-hidden="true">
          <h2>{{listName}}</h2>
        </div>
        <div class="column-sort">
          <span class="a">#</span>
          <div class="artist-title-album">
            <span class="list-title">{{$t('SONG_LIST.LIST_TITLE')}}</span>
            <span v-if="!isSimple" class="list-artist">{{$t('SONG_LIST.LIST_ARTIST')}}</span>
            <span v-if="!isSimple" class="list-album">{{$t('SONG_LIST.LIST_ALBUM')}}</span>
            <i class="ft-icon favourite-icon"></i>
            <span class="list-duration"><i class="ft-icon">clock</i></span>
          </div>
        </div>
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
        <template #default="{ item, index }">
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
    </div>
    <ContextMenu :top="contextMenuPos.y" :left="contextMenuPos.x" v-if="isContextMenuVisible">
      <ContextMenuItem :label="$t('CONTEXT_MENU.SONG_LIST_ITEM.ADD_PLAYLIST')"></ContextMenuItem>
      <ContextMenuItem :label="$t('CONTEXT_MENU.SONG_LIST_ITEM.ADD_QUEUE')" icon="queue"></ContextMenuItem>
      <ContextMenuItem :label="$t('CONTEXT_MENU.SONG_LIST_ITEM.ADD_FAVOURITE')"/>
      <ContextMenuItem :type="ContextMenuItemType.DIVIDER" />
      <ContextMenuItem
          v-if="!route.path.startsWith('/artists') && highlighted.length <= 1"
          :label="$t('CONTEXT_MENU.SONG_LIST_ITEM.GO_ARTIST', { artist: artistContextName })"
          icon="person"
          @click="router.push(`/artists/${songList[highlighted[0]].artist}`)"
      />
      <ContextMenuItem
          v-if="!route.path.startsWith('/albums') && highlighted.length <= 1"
          :label="$t('CONTEXT_MENU.SONG_LIST_ITEM.GO_ALBUM')"
          icon="album"
          @click="router.push(`/albums/${encodeURIComponent(songList[highlighted[0]].albumArtist)}/${encodeURIComponent(songList[highlighted[0]].album)}`)"
      />
      <ContextMenuItem v-if="highlighted.length <= 1" :type="ContextMenuItemType.DIVIDER" />
      <ContextMenuItem :label="$t('CONTEXT_MENU.SONG_LIST_ITEM.DELETE')" icon="close" />
      <ContextMenuItem v-if="route.path.startsWith('/playlists')" :label="$t('CONTEXT_MENU.SONG_LIST_ITEM.REMOVE_PLAYLIST')" icon="close" />
      <ContextMenuItem v-if="highlighted.length <= 1" :type="ContextMenuItemType.DIVIDER" />
      <ContextMenuItem v-if="highlighted.length <= 1" label="Show in file manager" @click="revealHighlighted" />
      <ContextMenuItem v-if="highlighted.length <= 1" :label="$t('SONG_INFO.MENU_ITEM')" @click="openSongInfo" />
    </ContextMenu>
    <SongInfoModal v-model:open="showSongInfo" :song="songInfoTarget" />
    <SongViewInfoView v-if="showInfoView" :genres="genres" :artists="artists" :description="description" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: calc(100% - 32px);
  height: 100%;
  --info-view-width: 0px;

  padding: 0 16px;

  display: grid;
  grid-template-columns: 1fr;
}

.wrapper.show-info-view {
  --info-view-width: 450px;
  grid-template-columns: 1fr var(--info-view-width);
}

.scroller {
  width: 100%;
  margin-bottom: 15px;
}

.list-column {
  min-width: 0;
  --list-title-height: 60px;
}

.sticky-sentinel {
  height: 1px;
  margin-bottom: -1px;
}

.list-header {
  position: sticky;
  top: var(--list-title-height);
  z-index: 3;
  height: 42px;
  margin-bottom: 5px;
}

.list-header::before {
  content: "";
  position: absolute;
  inset: 0 calc(-16px - var(--info-view-width)) 0 -16px;
  background: var(--bg);
  border-bottom: solid 1px var(--bd);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: -1;
  pointer-events: none;
}

.list-header-title {
  position: absolute;
  bottom: 100%;
  left: -16px;
  right: calc(-16px - var(--info-view-width));
  height: var(--list-title-height);
  display: flex;
  align-items: center;
  background: var(--fg-bg);
  border-radius: var(--main-border-radius-element);
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;

  h2 {
    margin: 0 75px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.list-header.stuck::before,
.list-header.stuck .list-header-title {
  opacity: 1;
}

.column-sort {
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  column-gap: 5px;
  justify-items: center;
  height: 42px;
  border-bottom: solid 1px var(--text-op);
  transition: border-color 0.2s;

  .artist-title-album {
    display: grid;
    grid-template-columns: 3fr 2fr 2fr 20px 0fr;
    align-items: center;
    column-gap: 20px;
    width: calc(100% - 25px);
    font-size: 14px;
  }
}

.list-header.simple .column-sort .artist-title-album {
  grid-template-columns: 3fr 20px 0fr;
}

.list-header.stuck .column-sort {
  border-color: transparent;
}

html.boldText .list-header-title h2 {
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
  .wrapper.show-info-view {
    --info-view-width: 350px;
  }
}

@media (max-width: 1200px) {
  .wrapper.show-info-view {
    --info-view-width: 250px;
  }
}
</style>