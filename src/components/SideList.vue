<script setup lang="ts">
import {OverlayScrollbarsComponent} from "overlayscrollbars-vue";
</script>

<template>
  <OverlayScrollbarsComponent class="side-list-container" :options="{
      scrollbars: {
        theme: 'os-theme-light',
        autoHide: 'move'
      }
    }">
    <slot/>
  </OverlayScrollbarsComponent>
</template>

<style scoped>
.side-list-container {
  position: fixed;
  width: var(--song-list-width);
  height: calc(100% - 85px - 44px - 32px);
  overflow: hidden;

  max-width: 300px;
  z-index: 4;
  padding: 16px;
  background: var(--bg);
  border-right: solid var(--bd) 1px;
  border-radius: var(--main-border-radius);

  transition: 0.3s cubic-bezier(0, 1, 0.35, 1);
  transition-property: width;
  transition-delay: 0.2s;
}

.side-list-container:deep(.category-label) {
  border-bottom: solid 1px var(--bd);
  padding: 0 0 10px 10px;
  margin: 30px 0 10px 0;
  transition: font-size 0.5s cubic-bezier(0, 1, 0.35, 1);
  transition-delay: 0.2s;
  height: 20px;
  display: flex;
  align-items: flex-end;
}

.side-list-container:deep(.category-label:first-child) {
  margin-top: 4px;
}

@media (max-width: 1350px) {
  .side-list-container:hover {
    width: 300px;
  }

  .side-list-container:deep(.category-label) {
    font-size: 0.8em;
  }

  .side-list-container:hover:deep(.category-label) {
    font-size: 1em;
  }

  .side-list-container::-webkit-scrollbar-thumb {
    background: transparent;
    background-clip: content-box;
  }

  .side-list-container:hover::-webkit-scrollbar-thumb {
    background: var(--text-op);
    background-clip: content-box;
  }
}
</style>