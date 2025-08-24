<script setup lang="ts">
import FiretailSong from "../types/FiretailSong";
import {computed, inject, onMounted, ref} from "vue";
import {audioPlayer} from "../renderer";

const props = defineProps<{
  song: FiretailSong,
  index: number,
  isSimple?: boolean
}>();

/*onMounted(() => {
  console.log(props.song.id);
})*/

const hovering = ref(false);

const isActive = computed(() => {
  if (!audioPlayer.reactive.currentSong) return '';
  if (props.song.id === audioPlayer.reactive.currentSong.id) return 'active';
  else return '';
})

const listIcon = computed(() => {
  if (!audioPlayer.reactive.currentSong) return 'play';
  if (audioPlayer.reactive.paused && props.song.id === audioPlayer.reactive.currentSong.id) {
    return 'play';
  } else if (!audioPlayer.reactive.paused && props.song.id === audioPlayer.reactive.currentSong.id) {
    return 'volume-up';
  } else {
    return 'play';
  }
})

function startPlaying() {
  console.log(`FROM SONGLISTITEM: ${props.index}`);
  play(props.index);
}

const play:Function = inject("play");
</script>

<template>
  <div class="song-item" :class="[isActive, isSimple ? 'simple' : '']" @dblclick="startPlaying"  @mouseover="hovering = true" @mouseleave="hovering = false">
    <i v-if="(listIcon !== 'volume-up' && !isSimple) || (isSimple && hovering && listIcon !== 'volume-up')" class="ft-icon play-pause" :style="(hovering || (isActive === 'active')) ? 'opacity: 1' : 'opacity: 0'" @click="play(index)">{{ listIcon }}</i>
    <div v-if="listIcon == 'volume-up'" class="playing-ani" @click="">
      <div class="bar one"></div>
      <div class="bar two"></div>
      <div class="bar three"></div>
    </div>
    <div v-if="isSimple && listIcon !== 'volume-up' && !hovering">
      <p v-if="song.trackNum !== null" class="track-num">{{song.trackNum}}</p>
      <p v-else class="track-num">-</p>
    </div>
    <div class="artist-title-album">
      <div class="list-title">
        <div class="title-name">
          <p>{{ song.title }}</p>
<!--            <div class="explicit" v-if="song.explicit == 1"><span>E</span></div>-->
          <span v-if="song.trackNum && !isSimple" class="track-num-list">{{ song.trackNum }}</span>
        </div>
        <span v-if="isSimple">{{song.artist}}</span>
      </div>
      <div v-if="!isSimple" class="list-artist">
<!--        <p v-for="(item, index) in artists" :key="index">
          <router-link :to="`/artists?hideTop=true&column=artist&q=${encodeURIComponent(item)}&view=artist_${encodeURIComponent(item)}`">
            <span class="artist-item">{{item}}<span v-if="index !== artists.length - 1">,</span></span>
          </router-link>
        </p>-->
        <p>{{song.artist}}</p>
      </div>
      <div v-if="!isSimple" class="list-album"><p>{{song.album}}</p></div>
      <i class="ft-icon favourite-icon" :style="hovering ? 'opacity: 1' : 'opacity: 0'">heart</i>
      <p class="list-duration"><span>{{song.duration}}</span></p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.song-item {
  overflow: hidden;
  position: relative;
  height: 42px;
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  justify-items: center;
  column-gap: 5px;
  transition: .25s;
  transition-property: margin-left;
  border-radius: 10px;
}

.song-item.simple {
  height: 55px;
}

.song-item.simple.albums {
  grid-template-columns: 40px 40px 40px 1fr;
}

.drag-indicate-line {
  width: calc(100% - 40px);
  height: 2px;
  background-color: var(--hl-txt);
  position: absolute;
}

.song-item:hover {
  background: #ffffff18;
  box-shadow: inset 0 0 0 1px var(--bd-op);
}

.song-item.nohover:hover {
  background: none;
}

.song-item.hactive {
  background: #ffffff36;
}

.song-item.hactive:hover {
  background: #ffffff22;
}

.song-item.hactive.notop {
  border-radius: 0px 0px 10px 10px;
}

.song-item.hactive.nobottom {
  border-radius: 10px 10px 0px 0px;
}

.song-item.hactive.none {
  border-radius: 0px;
}

html.light {
  li:hover {
    background: #00000010;
  }

  .song-item.hactive {
    background: #00000028;
  }

  .song-item.hactive:hover {
    background: #00000022;
  }
}

.play-pause {
  font-size: 24px !important;
  padding: 0;
  cursor: pointer;
  opacity: 0;
}

.play-pause:hover {
  opacity: .5 !important;
}

.song-item.active {
  .list-title {
    color: var(--hl-txt);
  }
}

.song-item.active a {
  //color: var(--hl-txt);
}

.artist-title-album {
  display: grid;
  column-gap: 20px;
  grid-template-columns: 3fr 2fr 2fr 20px 0fr;
  align-items: center;
  width: calc(100% - 25px);
  font-size: 14px;
  height: 100%;
}

.song-item.simple .artist-title-album {
  grid-template-columns: 3fr 20px 0fr;
}

.artist-title-album p {
  margin-top: 0px;
  margin-bottom: 0px;
}

.list-title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  white-space: nowrap;
  display: flex;
  align-items: center;

  .title-name {
    display: flex;
    align-items: center;
  }
}

.song-item.simple .list-title {
  display: block;
}

.song-item.simple .list-title {
  p {
    margin: 0 0 5px;
    font-size: 15px;
  }

  span {
    font-size: 13px;
    opacity: 0.75;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.list-artist,
.list-album,
.list-duration {
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  white-space: nowrap;
}

.list-artist {
  display: flex;

  .artist-item {
    margin-right: 4px;

    span {
      color: var(--text);
    }
  }
}

.list-artist span, .list-album span, .list-duration span {
  opacity: 0.8;
}

.list-duration {
  text-align: right;
  min-width: 40px;
}

.list-artist span, .list-album span {
  pointer-events: all;
}

.list-artist span:hover, .list-album span:hover {
  color: var(--hl-txt);
  text-decoration: underline;
  cursor: pointer;
  opacity: 1;
}

.list-artist span:active, .list-album span:active {
  color: var(--hl-txt);
  text-decoration: underline;
  opacity: .8;
}

.favourite-icon {
  font-size: 23px;
  cursor: pointer;
  opacity: 0;
  min-width: 23px;
  border-radius: 100px;
}

.song-item:hover .favourite-icon, .song-item.hactive .favourite-icon {
  opacity: 0.5;
}

.favourite-icon:hover {
  opacity: 1;
}

.track-num {
  margin: 0 10px;
  font-size: 16px;
  opacity: 0.5;
  text-align: center;
  max-width: 20px;
  width: 20px;
}

.track-num-list {
  margin-left: 15px;
  opacity: 0.5;
}

@media (max-width: 900px) {
  .list-album {
    display: none;
  }
  .artist-title-album {
    grid-template-columns: 3fr 1.5fr 0fr 20px 0fr;
  }
}

.playing-ani {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 21px;
  height: 15px;
}

.playing-ani .bar {
  min-width: 3px;
  height: 90%;
  background: var(--hl-txt);
  margin: 0 1.5px;
  transition: 0.25s;
  transition-property: transform;
  border-radius: 100px;
  transform: scale(100%);
  transform-origin: bottom;
  will-change: transform;
}

@keyframes barmove {
  from {
    transform: scaleY(15%);
  }
  to {
    transform: scaleY(100%);
  }
}

.playing-ani .bar {
  animation: barmove 0.4s infinite ease-out alternate;
}

.playing-ani .bar.two {
  animation-delay: -0.25s;
}

.playing-ani .bar.one {
  animation-delay: -0.5s;
}

.explicit {
  width: 14px;
  height: 14px;
  font-size: 0.8em;
  font-weight: 600;
  background: white;
  border-radius: 2px;
  color: black;
  display: flex;
  justify-content: center;
}
</style>