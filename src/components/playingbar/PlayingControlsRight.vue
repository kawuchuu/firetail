<script setup lang="ts">
import {audioPlayer} from "../../renderer";
import SeekBar from "../SeekBar.vue";

function rangeChange(level:number) {
  audioPlayer.volume = level;
}
</script>

<template>
  <div class="right-controls">
    <i class="ft-icon">queue</i>
    <i class="ft-icon vol-btn">volume-up</i>
    <div class="vol-bar-wrapper">
      <SeekBar @range-change="rangeChange" :range-current="audioPlayer.reactive.volume" :range-length="1" :change-on-move="true" />
    </div>
    <i class="ft-icon">expand</i>
  </div>
</template>

<style scoped>
.right-controls {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  gap: 20px;
}

i {
  font-size: 22px;
  cursor: pointer;
  border-radius: 100px;
}

i:hover {
  opacity: 0.75;
}

i:active {
  opacity: 0.5;
}

.vol-bar-wrapper {
  width: 120px;
}
</style>