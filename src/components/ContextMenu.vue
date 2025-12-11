<script setup lang="ts">
import {computed, inject, Ref, ref} from "vue";

const props = defineProps<{
  top: number;
  left: number;
}>();

const close = inject<() => void>("closeContextMenu");
const contextMenu: Ref<HTMLDivElement> = ref();

const offset = computed(() => {
  let correctTop = props.top;
  let correctLeft = props.left;
  if (contextMenu.value) {
    const rect = contextMenu.value.getBoundingClientRect();
    const overflowTop = rect.bottom - window.innerHeight;
    const overflowLeft = rect.right - window.innerWidth;
    if (overflowTop > 0) correctTop -= overflowTop;
    if (overflowLeft > 0) correctLeft -= overflowLeft;
  }
  return `top: ${correctTop}px; left: ${correctLeft}px;`;
})
</script>

<template>
  <teleport to="body">
    <div class="context-menu-wrapper" @pointerdown="close">
      <div class="context-menu" :style="offset" ref="contextMenu">
        <slot>context menu wip</slot>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.context-menu-wrapper {
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  position: fixed;
  z-index: 99999;
}

.context-menu {
  width: 175px;
  height: 300px;
  background: var(--fg-bg);
  border: solid 1px var(--bd);
  border-radius: 10px;
  box-shadow: 0 8px 16px var(--bg);
  position: absolute;
}
</style>