<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch} from "vue";
import {audioPlayer} from '../../renderer';
import {getArt} from "../../modules/art";
import {isFavourite, toggleFavourite} from "../../modules/favourites";

const imagePath = ref('');
let artRequest = 0;

const thumbStyle = computed(() => imagePath.value ? {backgroundImage: `url('${imagePath.value}')`} : {});

async function changeImagePath() {
  const song = audioPlayer.reactive.currentSong;
  const request = ++artRequest;
  const path = song && song.hasImage === 1 ? await getArt(song.albumArtist, song.album) : '';
  if (request === artRequest) imagePath.value = path;
}

watch(() => audioPlayer.reactive.currentSong, changeImagePath);

const PREVIEW_SIZE = 400;
const PREVIEW_DELAY = 250;
const PREVIEW_TOP_MARGIN = 56;

const artThumb = useTemplateRef<HTMLElement>('artThumb');
const previewOpen = ref(false);
const previewStyle = ref<Record<string, string>>({});
let previewTimer: ReturnType<typeof setTimeout> | null = null;

function openPreviewSoon() {
  if (!imagePath.value) return;
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = setTimeout(openPreview, PREVIEW_DELAY);
}

function openPreview() {
  previewTimer = null;
  const rect = artThumb.value?.getBoundingClientRect();
  if (!rect) return;
  const size = Math.max(rect.width, Math.min(PREVIEW_SIZE, rect.bottom - PREVIEW_TOP_MARGIN));
  previewStyle.value = {
    left: `${rect.left}px`,
    top: `${rect.bottom - size}px`,
    width: `${size}px`,
    height: `${size}px`,
    '--start-scale': `${rect.width / size}`,
  };
  previewOpen.value = true;
}

function closePreview() {
  if (previewTimer) clearTimeout(previewTimer);
  previewTimer = null;
  previewOpen.value = false;
}

watch(imagePath, path => {
  if (!path) closePreview();
});

const currentSongId = computed(() => audioPlayer.reactive.currentSong?.id);
const favourite = computed(() => isFavourite(currentSongId.value));

function onFavouriteClick() {
  if (currentSongId.value) toggleFavourite(currentSongId.value);
}

const SCROLL_SPEED = 30;
const SCROLL_PAUSE = 3000;
const SCROLL_GAP = 48;
const EDGE_FADE = 16;

const titleLink = useTemplateRef<{$el: HTMLElement}>('titleLink');
const titleTrack = useTemplateRef<HTMLElement>('titleTrack');
const titleText = useTemplateRef<HTMLElement>('titleText');
const titleScrolling = ref(false);
let scrollKey = '';
let trackAnimation: Animation | null = null;
let fadeAnimation: Animation | null = null;
let resizeObserver: ResizeObserver | null = null;

function prefersReducedMotion() {
  return document.documentElement.classList.contains('reduceMotion')
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function stopTitleScroll() {
  trackAnimation?.cancel();
  fadeAnimation?.cancel();
  trackAnimation = null;
  fadeAnimation = null;
  titleScrolling.value = false;
  scrollKey = '';
}

async function updateTitleScroll() {
  const link = titleLink.value?.$el;
  const text = titleText.value;
  if (!link || !text) return;
  const available = link.clientWidth - (parseFloat(getComputedStyle(link).paddingRight) || 0);
  const textWidth = text.scrollWidth;
  if (textWidth <= available + 1 || prefersReducedMotion()) {
    stopTitleScroll();
    return;
  }
  const key = `${audioPlayer.reactive.title}|${textWidth}`;
  if (key === scrollKey && trackAnimation) return;
  stopTitleScroll();
  scrollKey = key;
  titleScrolling.value = true;
  await nextTick();
  if (!titleTrack.value || scrollKey !== key) return;

  const distance = textWidth + SCROLL_GAP;
  const scrollTime = (distance / SCROLL_SPEED) * 1000;
  const duration = SCROLL_PAUSE + scrollTime;
  const moveStart = SCROLL_PAUSE / duration;
  const fadeTime = Math.min((EDGE_FADE / SCROLL_SPEED) * 1000, scrollTime / 2) / duration;
  const timing = {duration, iterations: Infinity};

  trackAnimation = titleTrack.value.animate([
    {transform: 'translateX(0)', offset: 0},
    {transform: 'translateX(0)', offset: moveStart},
    {transform: `translateX(-${distance}px)`, offset: 1},
  ], timing);
  fadeAnimation = link.animate([
    {'--title-fade': '0px', offset: 0},
    {'--title-fade': '0px', offset: moveStart},
    {'--title-fade': `${EDGE_FADE}px`, offset: moveStart + fadeTime},
    {'--title-fade': `${EDGE_FADE}px`, offset: 1 - fadeTime},
    {'--title-fade': '0px', offset: 1},
  ], timing);
}

function pauseTitleScroll() {
  trackAnimation?.pause();
  fadeAnimation?.pause();
}

function resumeTitleScroll() {
  trackAnimation?.play();
  fadeAnimation?.play();
}

watch(() => audioPlayer.reactive.title, async () => {
  stopTitleScroll();
  await nextTick();
  updateTitleScroll();
});

onMounted(() => {
  resizeObserver = new ResizeObserver(() => updateTitleScroll());
  const titleArtist = titleLink.value?.$el.parentElement;
  if (titleArtist) resizeObserver.observe(titleArtist);
  document.fonts.ready.then(() => updateTitleScroll());
  updateTitleScroll();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  stopTitleScroll();
  closePreview();
});
</script>

<template>
    <div class="song-info">
      <teleport defer to="#songImage">
        <div
          ref="artThumb"
          class="song-album-art inner-outline"
          :style="thumbStyle"
          @pointerenter="openPreviewSoon"
          @pointerleave="closePreview"
        />
      </teleport>
      <teleport to="body">
        <transition name="art-preview">
          <img
            v-if="previewOpen && imagePath"
            class="art-preview"
            :src="imagePath"
            :style="previewStyle"
            alt=""
            draggable="false"
          />
        </transition>
      </teleport>
      <div class="title-artist">
            <RouterLink
              ref="titleLink"
              class="song-title"
              :class="{scrolling: titleScrolling}"
              @pointerenter="pauseTitleScroll"
              @pointerleave="resumeTitleScroll"
            >
              <span ref="titleTrack" class="song-title-track">
                <span ref="titleText" class="song-title-text">{{audioPlayer.reactive.title}}</span>
                <span v-if="titleScrolling" class="song-title-text" :style="{marginLeft: `${SCROLL_GAP}px`}" aria-hidden="true">{{audioPlayer.reactive.title}}</span>
              </span>
            </RouterLink>
            <RouterLink class="song-artist">{{audioPlayer.reactive.artist}}</RouterLink>
        </div>
        <button
          v-if="currentSongId"
          type="button"
          class="ft-icon favourite-icon"
          :class="{active: favourite}"
          :aria-pressed="favourite"
          :aria-label="$t(favourite ? 'CONTEXT_MENU.SONG_LIST_ITEM.REMOVE_FAVOURITE' : 'CONTEXT_MENU.SONG_LIST_ITEM.ADD_FAVOURITE')"
          @click="onFavouriteClick"
        >{{ favourite ? 'heart-filled' : 'heart' }}</button>
    </div>
</template>

<style scoped>
.song-info {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.title-artist {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    -webkit-mask-image: -webkit-linear-gradient(180deg, transparent, #000 20px);
    width: 100%;
}

.song-album-art {
    min-width: 55px;
    min-height: 55px;
    left: 1px;
    border-radius: 4px;
    z-index: 2;
    position: relative;
    background-image: url('../../assets/no_imagealt.svg');
    background-color: var(--bg);
    background-position: center;
    background-size: cover;
    transition: background-image 0.1s;
}

.song-album-art::after {
    border-radius: 4px;
}

.art-preview {
    position: fixed;
    z-index: 1000;
    box-sizing: border-box;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--bd);
    background: var(--bg);
    box-shadow: 0 16px 48px rgba(0, 0, 0, .5);
    transform-origin: bottom left;
    pointer-events: none;
}

.art-preview-enter-active {
    transition:
        transform 0.4s cubic-bezier(0, 1, 0.35, 1),
        opacity 0.12s ease;
}

.art-preview-leave-active {
    transition:
        transform 0.2s ease-in,
        opacity 0.2s ease-in;
}

.art-preview-enter-from,
.art-preview-leave-to {
    transform: scale(var(--start-scale));
    opacity: 0;
}

.reduceMotion .art-preview-enter-from,
.reduceMotion .art-preview-leave-to {
    transform: none;
}

@media (prefers-reduced-motion: reduce) {
    .art-preview-enter-from,
    .art-preview-leave-to {
        transform: none;
    }
}

@property --title-fade {
    syntax: '<length>';
    inherits: false;
    initial-value: 0px;
}

.song-title {
    font-size: 15px;
    overflow: hidden;
    line-height: 20px;
    white-space: nowrap;
    width: fit-content;
    font-weight: 600;
    padding-right: 20px;
    margin-bottom: 3px;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    max-width: 100%;
    box-sizing: border-box;
}

.song-title.scrolling {
    -webkit-mask-image: linear-gradient(to right, transparent, #000 var(--title-fade));
}

.song-title-track {
    display: flex;
    min-width: 0;
}

.song-title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-title.scrolling .song-title-track,
.song-title.scrolling .song-title-text {
    flex-shrink: 0;
    overflow: visible;
}

.song-title:hover, .song-artist:hover {
    text-decoration: underline;
}

.boldText .song-title {
    font-weight: bold;
}

.song-artist {
    margin: 0;
    margin-right: 20px;
    opacity: .75;
    font-size: 12px;
    overflow: hidden;
    line-height: 15px;
}

.favourite-icon {
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    color: inherit;
    font-size: 22px;
    opacity: 0.5;
    margin-left: 12px;
    border-radius: 100px;
}

.favourite-icon:hover {
    opacity: 0.8;
}

.favourite-icon:active {
    opacity: 0.3;
}

.favourite-icon.active {
    opacity: 1;
    color: var(--hl-txt)
}

.favourite-icon.active:hover {
    opacity: 0.7;
}

.favourite-icon.active:active {
    opacity: 0.5;
}

.favourite-icon:focus-visible {
    opacity: 1;
    outline: 2px solid var(--hl-txt);
    outline-offset: 2px;
}
</style>