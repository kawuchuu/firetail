<script setup lang="ts">
import {onMounted, ref, computed, onBeforeMount} from 'vue';
import mossFanfare from '../assets/moss_fanfare.wav';
import sndTxt from '../assets/drbox/snd_text.wav';

let borderZero = performance.now();
const currentBorder = ref(0);
function doBorderAnimation() {
  const value = (performance.now() - borderZero) / 400;
  if (value >= 1) {
    if (currentBorder.value >= 7) currentBorder.value = 0
    else currentBorder.value++;
    borderZero = performance.now();
  }
  requestAnimationFrame(doBorderAnimation);
}

const message = [
  { text: '* You found the ', highlight: false },
  { text: '[Moss]', highlight: true },
  { text: '!', highlight: false }
];
const totalChars = message.reduce((sum, seg) => sum + seg.text.length, 0);
const revealedChars = ref(0);
const charDelay = 35;

const visibleMessage = computed(() => {
  let remaining = revealedChars.value;
  return message.map(seg => {
    const len = Math.max(0, Math.min(remaining, seg.text.length));
    remaining -= len;
    return { text: seg.text.slice(0, len), highlight: seg.highlight };
  });
});

const audioCtx = new AudioContext();
let blipBuffer: AudioBuffer | null = null;

function playBlip() {
  if (!blipBuffer) return;
  const src = audioCtx.createBufferSource();
  src.buffer = blipBuffer;
  src.connect(audioCtx.destination);
  src.start();
}

let textZero = performance.now();
function doTextAnimation() {
  const elapsed = performance.now() - textZero;
  const prev = revealedChars.value;
  revealedChars.value = Math.min(Math.floor(elapsed / charDelay), totalChars);
  if (revealedChars.value > prev) {
    playBlip();
  }
  if (revealedChars.value < totalChars) {
    requestAnimationFrame(doTextAnimation);
  }
}

onBeforeMount(async () => {
  try {
    const response = await fetch(sndTxt);
    blipBuffer = await audioCtx.decodeAudioData(await response.arrayBuffer());
  } catch {
    //
  }
});

onMounted(() => {
  const audio = new Audio(mossFanfare);
  audio.play();
  requestAnimationFrame(doBorderAnimation);
  requestAnimationFrame(doTextAnimation);
});
</script>

<template>
  <div class="textbox" :class="`num${currentBorder}`">
    <div class="corner corner-top-left"></div>
    <div class="corner corner-top-right"></div>
    <div class="corner corner-bottom-left"></div>
    <div class="corner corner-bottom-right"></div>
    <div class="textbox-top-repeat"></div>
    <div class="textbox-top-repeat bottom"></div>
    <div class="textbox-side-repeat"></div>
    <div class="textbox-side-repeat right"></div>
    <div class="box-bg">
      <p>
        <template v-for="(seg, i) in visibleMessage" :key="i">
          <span v-if="seg.highlight" class="highlight">{{ seg.text }}</span>
          <template v-else>{{ seg.text }}</template>
        </template>
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.textbox {
  width: 274px;
  height: 88px;
  box-sizing: border-box;
  transform: scale(2);
  transform-origin: center;
  image-rendering: pixelated;
  font-family: '8bitoperator JVE', sans-serif;
  letter-spacing: 1px;
  pointer-events: all;
}

.box-bg {
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  background-color: black;
  left: 16px;
  top: 16px;
  position: absolute;
}

.box-bg p {
  color: white;
  font-size: 16px;
  margin: 0;
  padding: 0;
  text-shadow: 0.07em 0.07em 0 #100a59;
}

.box-bg .highlight {
  background: linear-gradient(to bottom, #ffffff, #00d304);
  background-clip: text;
  color: transparent;
  text-shadow: none;
  filter: drop-shadow(0.07em 0.07em 0 #005500);
}

.textbox-top-repeat {
  background: top left url("../assets/drbox/spr_textbox_top.png") repeat-x padding-box;
  position: absolute;
  top: 0;
  left: 16px;
  width: calc(100% - 32px);
  height: 16px;
}

.textbox-side-repeat {
  background: top left url("../assets/drbox/spr_textbox_left.png") repeat-y padding-box;
  position: absolute;
  top: 16px;
  width: 16px;
  height: calc(100% - 32px);
}

.textbox-top-repeat.bottom {
  bottom: 0;
  top: unset;
  transform: scaleY(-1);
}

.textbox-side-repeat.right {
  right: 0;
  left: unset;
  transform: scaleX(-1);
}

.corner {
  position: absolute;
  width: 16px;
  height: 16px;
  background-image: url("../assets/drbox/spr_textbox_topleft.png");
  background-repeat: no-repeat;
}

.textbox.num0 .corner {
  background-position: 0 0;
}

.textbox.num1 .corner {
  background-position: -16px 0;
}

.textbox.num2 .corner {
  background-position: -32px 0;
}

.textbox.num3 .corner {
  background-position: -48px 0;
}

.textbox.num4 .corner {
  background-position: -64px 0;
}

.textbox.num5 .corner {
  background-position: -80px 0;
}

.textbox.num6 .corner {
  background-position: -96px 0;
}

.textbox.num7 .corner {
  background-position: -112px 0;
}

.corner-top-left {
  top: 0;
  left: 0;
}

.corner-top-right {
  top: 0;
  right: 0;
  transform: scaleX(-1);
}

.corner-bottom-left {
  bottom: 0;
  left: 0;
  transform: scaleY(-1);
}

.corner-bottom-right {
  bottom: 0;
  right: 0;
  transform: scale(-1, -1);
}
</style>