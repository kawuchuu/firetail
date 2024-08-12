<script setup lang="ts">
import {useRouter} from 'vue-router';

const router = useRouter();

const platform = window.process.platform;
</script>

<template>
  <div class="top-bar">
    <div class="inner">
      <div class="nav-hist-buttons">
        <div @click="router.go(-1)" class="std-top-btn nav-button">
          <i class="ft-icon">chevron-left</i>
        </div>
        <div @click="router.go(1)" class="std-top-btn nav-button">
          <i class="ft-icon">chevron-right</i>
        </div>
      </div>
      <div class="right-buttons">
        <div class="std-top-btn">
          <i class="ft-icon">search</i>
        </div>
        <div class="std-top-btn">
          <i class="ft-icon">add</i>
        </div>
        <div class="std-top-btn">
          <i class="ft-icon">settings</i>
        </div>
        <div v-if="platform === 'win32'" class="divider" />
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
  margin-right: 10px;
  cursor: pointer;
  /* border: solid 1px #5f587c; */
  -webkit-app-region: no-drag;
}

.divider {
  margin: 0 145px 0 4px;
  width: 1px;
  height: 25px;
  border-left: solid 1px var(--text);
  opacity: 0.2;
}

.nav-hist-buttons, .right-buttons {
  display: flex;
  align-items: center;
  gap: 5px;
  pointer-events: all;
}

.std-top-btn:hover i {
  opacity: 0.5;
}

.std-top-btn:active {
  opacity: 0.75;
}

.std-top-btn:active i {
  opacity: 0.5;
}

.std-top-btn.inactive {
  opacity: 0.5;
  pointer-events: none;
  backdrop-filter: none;
}

.std-top-btn i {
  font-size: 22px;
  position: relative;
  bottom: 2px;
}
</style>