<script setup lang="ts">
import { audioPlayer } from "../renderer";
import FiretailSong from "../types/FiretailSong";
import {timeFormat} from "../modules/timeformat";

const testSongs:FiretailSong[] = [{"title":"drifting","artist":"Night Tapes","allArtists":"[\"Night Tapes\"]","albumArtist":"Night Tapes","album":"assisted memories","duration":"3:32","realdur":212.4404761904762,"path":"G:\\Music\\Night Tapes\\assisted memories\\Night Tapes - assisted memories - 01 drifting.flac","id":"YftUzgQDUS","hasImage":1,"trackNum":1,"year":"2023","disc":null,"explicit":null,"genre":null},{"title":"loner","artist":"Night Tapes","allArtists":"[\"Night Tapes\"]","albumArtist":"Night Tapes","album":"assisted memories","duration":"3:56","realdur":236.72038548752835,"path":"G:\\Music\\Night Tapes\\assisted memories\\Night Tapes - assisted memories - 02 loner.flac","id":"q4MtE72rN3","hasImage":1,"trackNum":2,"year":"2024","disc":null,"explicit":null,"genre":null},{"title":"easy time to be alive","artist":"Night Tapes","allArtists":"[\"Night Tapes\"]","albumArtist":"Night Tapes","album":"assisted memories","duration":"2:56","realdur":176.38839002267574,"path":"G:\\Music\\Night Tapes\\assisted memories\\Night Tapes - assisted memories - 03 easy time to be alive.flac","id":"9oKPB0CZqI","hasImage":1,"trackNum":3,"year":"2024","disc":null,"explicit":null,"genre":null},{"title":"projections","artist":"Night Tapes","allArtists":"[\"Night Tapes\"]","albumArtist":"Night Tapes","album":"assisted memories","duration":"4:20","realdur":260.4851927437642,"path":"G:\\Music\\Night Tapes\\assisted memories\\Night Tapes - assisted memories - 04 projections.flac","id":"Dogb2rhlMV","hasImage":1,"trackNum":4,"year":"2024","disc":null,"explicit":null,"genre":null},{"title":"assisted memories","artist":"Night Tapes","allArtists":"[\"Night Tapes\"]","albumArtist":"Night Tapes","album":"assisted memories","duration":"2:33","realdur":153.2427210884354,"path":"G:\\Music\\Night Tapes\\assisted memories\\Night Tapes - assisted memories - 05 assisted memories.flac","id":"vkja5Fp7DP","hasImage":1,"trackNum":5,"year":"2024","disc":null,"explicit":null,"genre":null},{"title":"waterfall","artist":"Night Tapes","allArtists":"[\"Night Tapes\"]","albumArtist":"Night Tapes","album":"assisted memories","duration":"3:42","realdur":222.27272108843536,"path":"G:\\Music\\Night Tapes\\assisted memories\\Night Tapes - assisted memories - 06 waterfall.flac","id":"6Wc2QI03wd","hasImage":1,"trackNum":6,"year":"2024","disc":null,"explicit":null,"genre":null},{"title":"every day is a game","artist":"Night Tapes","allArtists":"[\"Night Tapes\"]","albumArtist":"Night Tapes","album":"assisted memories","duration":"4:09","realdur":249.68743764172336,"path":"G:\\Music\\Night Tapes\\assisted memories\\Night Tapes - assisted memories - 07 every day is a game.flac","id":"JmBkSpLCtm","hasImage":1,"trackNum":7,"year":"2024","disc":null,"explicit":null,"genre":null}];

async function playSong() {
  audioPlayer.enqueue(testSongs, true, true, 0);
}

function updateTime(evt:InputEvent) {
  audioPlayer.setCurrentTime(parseInt((evt.target as HTMLInputElement).value));
}
</script>

<template>
  <button @click="playSong">Play song</button>
  <button @click="audioPlayer.togglePlay()">Pause/resume</button>
  <button @click="audioPlayer.prevSong()">Previous</button>
  <button @click="audioPlayer.nextSong()">Next</button>
  <input type="range" @input="updateTime" min="0" :max="audioPlayer.reactive.duration" :value="audioPlayer.reactive.currentTime">
  <span>{{timeFormat(audioPlayer.reactive.currentTime)}} / {{timeFormat(audioPlayer.reactive.duration)}}</span>
  <p>currentTime: {{audioPlayer.reactive.currentTime}}</p>
  <p>index: {{audioPlayer.index}}</p>
</template>

<style scoped>

</style>