<script setup lang="ts">
import {computed, ref} from "vue";

const emit = defineEmits<{
  (e: 'rangeChange', id: number): void
}>()

const props = defineProps<{
  rangeCurrent: number,
  rangeLength: number,
  changeOnMove?: boolean,
  mono?: boolean
}>()

const seekMouse = ref({
  down: false,
  over: false
})
const seekBar = ref(null)
const seekFill = ref(null)
const seekFillHover = ref(null);
const handle = ref(null)

const fill = computed(() => {
  return `width: ${(props.rangeCurrent / props.rangeLength) * 100}%`
})

function getP(e: MouseEvent, el: Element) {
  let pBar = (e.clientX - el.getBoundingClientRect().x) / el.clientWidth;
  pBar = clamp(0, pBar, 1);
  return pBar;
}

function clamp(min: number, val: number, max: number) {
  return Math.min(Math.max(min, val), max);
}

function seekMove(evt: MouseEvent) {
  if (!seekMouse.value.down) return
  seekFill.value.style.transition = 'none';
  const pBar = getP(evt, seekBar.value)
  seekFill.value.style.width = pBar * 100 + '%'
  if (props.changeOnMove) {
    emit('rangeChange', pBar * props.rangeLength);
  }
}

function seekUp(evt: MouseEvent) {
  window.removeEventListener('mousemove', seekMove)
  window.removeEventListener('mouseup', seekUp)
  seekFill.value.style.removeProperty('transition');
  if (!seekMouse.value.down) return
  seekMouse.value.down = false
  const pBar = getP(evt, seekBar.value)
  seekFill.value.style.width = pBar * 100 + '%'
  emit('rangeChange', pBar * props.rangeLength);
  if (!seekMouse.value.over) {
    handle.value.classList.remove('hover');
    seekFillHover.value.classList.remove('hover');
  }
}

function seekDown(evt: MouseEvent) {
  const pBar = getP(evt, seekBar.value)
  seekMouse.value.down = true
  window.addEventListener('mousemove', seekMove)
  window.addEventListener('mouseup', seekUp)
  seekFill.value.style.width = pBar * 100 + '%'
}

function seekHover() {
  seekMouse.value.over = true
  handle.value.classList.add('hover')
}

function hoverMove(evt:PointerEvent) {
  let pBar = getP(evt, seekBar.value);
  seekFillHover.value.style.width = pBar * 100 + '%';
  seekFillHover.value.classList.add('hover');
}

function seekLeave() {
  seekMouse.value.over = false
  if (seekMouse.value.down) return
  handle.value.classList.remove('hover');
  seekFillHover.value.classList.remove('hover');
}
</script>

<template>
  <div ref="seekBarWrapper" :class="mono ? 'mono' : ''" class="seek-bar-inner-container" @pointermove="hoverMove" @mouseover="seekHover" @mouseleave="seekLeave" @mousedown="seekDown">
    <div class="seek-bar" ref="seekBar">
      <div ref="seekFill" :style="fill" class="fill"></div>
      <div ref="seekFillHover" class="fill-hover"></div>
      <div ref="handle" class="handle"></div>
      <!-- <div ref="hoverIndicate" class="seek-hover-indicate">
          <div class="num">{{ hoverIndicateNum }}</div>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
.mono {
  --hl-txt: var(--text);
}

.seek-bar-inner-container {
  padding-top: 3px;
  padding-bottom: 3px;
  position: relative;
  z-index: 15;
  width: 100%;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.seek-bar {
  margin: 10px 0px;
  width: 100%;
  background: var(--text-op);
  display: flex;
  align-items: center;
  border-radius: 999px;
  height: 4px;
  z-index: 5;
}

.seek-bar.hover, .fill.hover {
  height: 5px;
}

.fill {
  height: 4px;
  background: var(--hl-txt);
  border-radius: 10000px;
  transition: cubic-bezier(0, 1, 0.35, 1) .15s;
  width: 0%;
  z-index: 2;
}

.fill-hover {
  height: 4px;
  background-color: #ffffff36;
  border-radius: 10px;
  position: absolute;
  opacity: 0;
  z-index: 3;
  transition: 100ms;
  transition-property: opacity;
}

.handle {
  width: 0px;
  height: 0px;
  background: var(--hl-txt);
  border-radius: 11111px;
  margin-left: -5px;
  transform: scale(1.5);
  transition: all .1s;
  z-index: 3;
}

@keyframes indicate {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(-35px);
    opacity: 1;
  }
}

@keyframes indicate-yeah {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(-35px);
    opacity: 1;
  }
}

@keyframes indicate-reduce {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.seek-hover-indicate {
  background: var(--back-bg);
  border: solid 1px var(--bd);
  box-shadow: 0px 5px 10px rgba(0,0,0,.15);
  border-radius: 8px;
  transform: scale(0);
  position: fixed;
  /* transition: 0.25s cubic-bezier(0.17, 0.88, 0.23, 1.15);
  transition-property: transform; */

  animation: indicate 0.08s reverse;
  opacity: 0;

  padding: 0px 10px;
  left: 0;
  pointer-events: none;
  font-size: 14px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seek-hover-indicate.hover  {
  transform: scale(1) translateY(-35px);
  opacity: 1;
  animation: indicate-yeah 0.2s cubic-bezier(0.17, 0.88, 0.23, 1.15);
}

.seek-hover-indicate::after {
  content: "";
  width: 20px;
  height: 20px;
  transform: rotate(-45deg);
  background: var(--back-bg);
  position: absolute;
  bottom: -5px;
  left: 17px;
  border: solid 1px var(--bd);
  border-radius: 2px;
  box-shadow: 0px 5px 10px rgba(0,0,0,.15);
  z-index: 1;
}

.num {
  background: var(--back-bg);
  z-index: 2;
  position: relative;
  height: 30px;
  min-width: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.handle.hover {
  width: 10px !important;
  height: 10px !important;
  transition: all .1s !important;
}

.fill-hover.hover {
  opacity: 1;
}
</style>