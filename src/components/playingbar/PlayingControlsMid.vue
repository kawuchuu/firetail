<script setup lang="ts">
import {audioPlayer} from "../../renderer";
import {timeFormat} from "../../modules/timeformat";
import audio from "../../modules/audio";
import SeekBar from "../SeekBar.vue";
import {computed} from "vue";

function onTimeChange(time:number) {
  audioPlayer.setCurrentTime(time);
}

const playPauseIcon = computed(() => {
  return audioPlayer.reactive.paused ? "play-visual-centre" : "pause";
})
</script>

<template>
  <div class="track-controls">
    <div class="track-controls-inner-container">
      <div class="control-buttons">
        <i class="ft-icon repeat-shuffle" :title="$t('TOOLTIP.SHUFFLE')" role="button" aria-label="Shuffle" tabindex="0">shuffle</i>
        <i class="ft-icon skip-prev" @click="audioPlayer.prevSong()" :title="$t('TOOLTIP.PREVIOUS')" role="button" aria-label="Previous song" tabindex="0">previous</i>
        <div class="play-pause-icon" @click="audioPlayer.togglePlay()" :title="$t('TOOLTIP.PLAY_PAUSE')" tabindex="0" role="button"><i class="ft-icon" aria-hidden="true">{{playPauseIcon}}</i></div>
        <i class="ft-icon skip-prev next" @click="audioPlayer.nextSong()" :title="$t('TOOLTIP.NEXT')" role="button" aria-label="Next song" tabindex="0">next</i>
        <i class="ft-icon repeat-shuffle repeat" :title="$t('TOOLTIP.REPEAT')" role="button" aria-label="Repeat" tabindex="0">repeat</i>
      </div>
      <div class="seek-time-inner-container">
        <p class="song-duration" >{{ timeFormat(audioPlayer.reactive.currentTime) }}</p>
        <SeekBar @pointerdown="audioPlayer.doTimeUpdate(false);" @pointerup="audioPlayer.doTimeUpdate(true);" @range-change="onTimeChange" :range-current="audioPlayer.reactive.currentTime" :range-length="audioPlayer.reactive.duration" :change-on-move="false"/>
        <p class="song-duration">{{ timeFormat(audioPlayer.reactive.duration) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track-controls {
  overflow: hidden;
  width: 100%;
  height: 100%;
  z-index: 15;
  display: flex;
  flex-direction: row;
}

.track-controls-inner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%
}

.seek-time-inner-container {
  width: 100%;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
}

.song-duration {
  margin: 0 15px 2px;
  position: relative;
  min-width: 25px;
  max-width: 25px;
  text-align: right;
  font-size: 12px;
}

#songDurationLength {
  text-align: left;
}

.control-buttons {
  display: flex;
  align-items: center;
  height: 36px;
}

.control-buttons i {
  margin: 5px 7px;
  padding: 5px;
  border-radius: 100px;
}

.control-buttons .play-pause-icon {
  font-size: 30px;
  transition: 0.08s;
  transition-property: transform, text-shadow;
  background: white;
  color: black;
  border-radius: 100px;
  padding: 2px;
  margin: 6px 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-buttons .play-pause-icon i {
  margin: 0px;
  padding: 0px;
  font-size: 28px;
}

.control-buttons .play-pause-icon i:hover {
  opacity: 1;
}

.expand {
  display: none;
  font-size: 24px;
}

:root.light .control-buttons .play-pause-icon {
  background: var(--text);
  color: white;
}

.skip-prev {
  font-size: 24px;
}

.track-controls.hide .skip-prev {
  opacity: 0.5;
  pointer-events: none;
}

.repeat-shuffle {
  font-size: 22px;
}

.active {
  background-color: var(--hl-op);
  color: var(--hl-txt)
}

.control-buttons i:hover, #closeSidemenu:hover, #albumArtistBack:hover, .playing-bar-hidden i:hover, .top-controls i:hover {
  opacity: 0.6;
  cursor: pointer;
}

.play-pause-icon:hover, .play-pause-icon:active {
  transform: scale(1.15);
  opacity: 1 !important;
  box-shadow: 0px 2px 10px rgba(0,0,0,.5);
}

.play-pause-icon:active {
  transform: scale(1);
  opacity: 0.6 !important;
}

.track-controls.notplaying {
  opacity: 0.35;
  pointer-events: none;
}

.reduceMotion {
  .seek-hover-indicate {
    animation: indicate-reduce 0.15s;
  }

  .seek-hover-indicate.hover {
    animation: indicate-reduce 0.15s reverse;
  }

  .handle, .handle-hover, .fill, .control-buttons .play-pause-icon {
    transition-duration: 0s !important;
  }
}

.rtl .track-controls {
  direction: ltr;
}

.right-controls-root.mid {
  display: none;
}

@media (max-width: 970px) {
  .expand {
    display: block;
    transition: 0.3s cubic-bezier(0.15, 0.85, 0.25, 1.17);
    transition-property: transform;
  }

  .expand.shown {
    transform: rotate(180deg);
  }

  .right-controls-root.mid {
    display: block;
  }

  .track-controls-inner-container {
    align-items: flex-end;
  }

  .seek-time-inner-container {
    width: 100%;
  }

  .control-buttons {
    .play-pause-icon {
      order: 4;
    }

    .skip-prev {
      order: 3;
    }

    .skip-prev.next {
      order: 5;
    }

    .repeat-shuffle {
      order: 1;
    }

    .repeat-shuffle.repeat {
      order: 2;
    }
  }
}
</style>