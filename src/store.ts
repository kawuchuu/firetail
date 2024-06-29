import {reactive} from "vue";
import { audioPlayer } from "./renderer";

export const audioStore = reactive({
    currentTime: audioPlayer.currentTime,
    currentSong: audioPlayer.currentSong,
})