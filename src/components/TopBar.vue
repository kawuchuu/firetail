<script setup lang="ts">
import {useRouter} from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="top-bar">
    <div class="inner">
      <div class="nav-hist-buttons">
        <div @click="router.go(-1)" class="std-top-btn nav-button">
          <i class="ft-icon littlebitback">chevron-left</i>
        </div>
        <div @click="router.go(1)" class="std-top-btn nav-button">
          <i class="ft-icon littlebitback">chevron-right</i>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top-bar {
  width: calc(100vw - var(--sidebar-width));
  height: 44px;
  background: transparent;
  position: relative;
  top: 0;
  pointer-events: none;
  background: var(--back-bg);
  -webkit-app-region: drag;
  z-index: 10;
}

.top-bar .inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.std-top-btn {
  padding: 8px;
  border-radius: 40px;
  height: 18px;
  width: 18px;
}

.nav-hist-buttons {
  display: flex;
  align-items: center;
  margin-left: 10px;
  pointer-events: all;
}

.nav-button {
  margin-right: 10px;
  cursor: pointer;
  /* border: solid 1px #5f587c; */
  -webkit-app-region: no-drag;
}

.nav-button:hover i {
  opacity: 0.5;
}

.nav-button:active {
  opacity: 0.75;
}

.nav-button:active i {
  opacity: 0.5;
}

.nav-button.inactive {
  opacity: 0.5;
  pointer-events: none;
  backdrop-filter: none;
}

.nav-button i {
  font-size: 22px;
  position: relative;
  bottom: 2px;
}
</style>