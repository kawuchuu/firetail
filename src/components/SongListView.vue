<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {audioPlayer, viewStore} from "../renderer";
import BaseSongView from "./songlistviews/BaseSongTop.vue";
import {computed, nextTick, onMounted, provide, Ref, ref, watch} from "vue";
import SongListItem from "./SongListItem.vue";
import SongViewInfoView from "./songlistviews/SongViewInfoView.vue";
import Albums from "../types/Albums";
import {useRoute} from "vue-router";
import {getArt} from "../modules/art";

provide('play', play);

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
const isNurture = ref(false);

function play(index:number) {
  console.log(index);
  audioPlayer.enqueue(props.songList, true, true, index);
}

function updateScroll() {
  //console.log(columnSortInfo.value.clientHeight);
  const scrollWrapperPos = document.querySelector('.column-sort-wrapper').getBoundingClientRect().y;
  sortInfoOpacity.value = 1 - (((opacityToScrollBy.value - viewStore.scroll) / opacityToScrollBy.value));
  //isSticky.value = scrollWrapperPos < columnSortInfo.value.clientHeight + 86 + 5;
  isSticky.value = sortInfoOpacity.value >= 1;
  console.log(topView.value.clientHeight);
}

async function updateBackgroundArt() {
  if (route.params.albumArtist && route.params.album) {
    bgImagePath.value = await getArt(route.params.albumArtist, route.params.album);
  } else bgImagePath = '';
}

const getImage = computed( () => {
  if (bgImagePath.value !== '') {
    console.log(bgImagePath.value);
    return `background-image: url('${bgImagePath.value}'); filter: blur(25px) saturate(0.7);`;
  } else return ''
});

watch(() => viewStore.scroll, updateScroll);
watch(() => props.listName, () => {
  isNurture.value = props.artistName === 'Porter Robinson' && props.listName === 'Nurture';
})
watch(() => route.params, () => {
  updateBackgroundArt();
  nextTick(() => {
    opacityToScrollBy.value = document.querySelector('.scroll-wrapper').getBoundingClientRect().y - columnSortInfo.value.clientHeight - columnSortWrapper.value.clientHeight - 44;
  })
});

const getColumnSortOffset = computed(() => {
  if (!columnSortInfo.value || !columnSortInfo.value.clientHeight) return 'top: 0'
  return `top: ${columnSortInfo.value.clientHeight + 44}px`;
});

onMounted(() => {
  nextTick(() => {
    opacityToScrollBy.value = document.querySelector('.scroll-wrapper').getBoundingClientRect().y - columnSortInfo.value.clientHeight - columnSortWrapper.value.clientHeight - 44;
  });
  onMounted(() => {
    updateBackgroundArt();
  });
})
</script>

<template>
  <div class="wrapper" :class="[showInfoView ? 'show-info-view' : '', isNurture ? 'is-nurture' : '']">
    <div class="bg-gradient">
      <div class="list-gradient-fade" />
      <div class="bg-fade-bottom" />
      <div class="bg-art" :style="getImage" />
      <div class="bg-noise" />
      <div class="bg-image" />
      <div v-if="isNurture" class="nurture-egg" />
    </div>
    <RecycleScroller
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
        <div class="column-sort-wrapper" ref="columnSortWrapper" :class="isSimple ? 'simple' : ''">
          <div class="column-sort" :class="isSticky ? 'sticky' : ''" :style="getColumnSortOffset">
            <span class="a">#</span>
            <div class="artist-title-album">
              <span class="list-title">{{$t('SONG_LIST.LIST_TITLE')}}</span>
              <span v-if="!isSimple" class="list-artist">{{$t('SONG_LIST.LIST_ARTIST')}}</span>
              <span v-if="!isSimple" class="list-album">{{$t('SONG_LIST.LIST_ALBUM')}}</span>
              <i class="ft-icon favourite-icon"></i>
              <span class="list-duration"><i class="ft-icon">clock</i></span>
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
        <SongListItem :song="item" :index="index" :is-simple="isSimple" />
      </template>
    </RecycleScroller>
    <SongViewInfoView v-if="showInfoView" :genres="genres" :artists="artists" />
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: calc(100% - 16px);
  height: 100%;
  --fixed-width: calc(100vw - var(--sidebar-width) - 16px);
  --info-view-width: 0px;

  padding-left: 16px;

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

.column-sort.sticky {
  position: fixed;
  width: calc(var(--fixed-width) - 16px - var(--song-list-width) - var(--info-view-width));
  pointer-events: none;
  border-color: var(--bd);
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
    margin: 15px 75px;
  }
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

.bg-image, .nurture-egg {
  width: 100%;
  height: 100%;
  max-height: 420px;
  //background: linear-gradient(transparent, transparent, var(--bg)), radial-gradient(circle at top, transparent 40%, var(--bg)), url('../assets/songs-banner-new.png');
  background-image: url('../assets/songs-banner-new.png');
  background-size: cover;
  background-position: center 80%;
  z-index: -2;
  position: absolute;
  animation: fadeIn 1s;
}

.nurture-egg {
  background-image: url('../assets/squiggle2-transparent.png') !important;
  opacity: 0.75;
}

@media (max-width: 1600px) {
  .wrapper.show-info-view {
    grid-template-columns: 1fr 350px;
  }
}

@media (max-width: 1200px) {
  .wrapper.show-info-view {
    grid-template-columns: 1fr 250px;
  }
}
</style>