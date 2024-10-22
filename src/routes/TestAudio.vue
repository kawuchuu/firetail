<script setup lang="ts">
import { audioPlayer } from "../renderer";
import FiretailSong from "../types/FiretailSong";
import {timeFormat} from "../modules/timeformat";

function testSongs() {
  return window.library.getAllSongs().songs;
}

async function playSong() {
  audioPlayer.enqueue(testSongs(), true, true, 0);
}

function updateTime(evt:InputEvent) {
  audioPlayer.setCurrentTime(parseInt((evt.target as HTMLInputElement).value));
}
</script>

<template>
  <h1>Audio debug</h1>
  <button @click="playSong">Enqueue all songs</button>
  <button @click="audioPlayer.togglePlay()">Pause/resume</button>
  <button @click="audioPlayer.prevSong()">Previous</button>
  <button @click="audioPlayer.nextSong()">Next</button>
  <input type="range" @input="updateTime" min="0" :max="audioPlayer.reactive.duration" :value="audioPlayer.reactive.currentTime">
  <span>{{timeFormat(audioPlayer.reactive.currentTime)}} / {{timeFormat(audioPlayer.reactive.duration)}}</span>
  <p>currentTime: {{audioPlayer.reactive.currentTime}}</p>
  <p>index: {{audioPlayer.index}}</p>
  <p v-if="audioPlayer.reactive.currentSong">id: {{audioPlayer.reactive.currentSong.id}}</p>
  <p>queue length: {{audioPlayer.queue.length}}</p>
  <p>volume: {{audioPlayer.reactive.volume}}</p>
</template>

<style scoped>

</style>