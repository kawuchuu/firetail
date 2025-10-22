<script setup lang="ts">
import {ref} from 'vue';
const modalActive = ref(false);

function setModalActive(active: boolean) {
  modalActive.value = active;
}

defineProps<{
  title: string;
}>();

defineExpose({setModalActive});
</script>

<template>
  <teleport to="body">
    <transition name="backdrop" appear>
      <div v-if="modalActive" class="bg" @click="setModalActive(false)"/>
    </transition>
    <transition name="panel" appear>
      <div v-if="modalActive" class="modal-container">
        <div class="modal">
          <div class="modal-header">
            <h3>{{title}}</h3>
            <i @click="setModalActive(false)" class="ft-icon std-icon-btn">close</i>
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.modal-container {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.bg {
  position: fixed;
  inset: 0;
  z-index: 19;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

.modal {
  max-width: 600px;
  width: 90%;
  max-height: 80%;
  border-radius: 10px;
  background-color: var(--bg);
  border: 1px solid var(--bd);
  position: relative;
  z-index: 21;
  pointer-events: all;
}

.backdrop-enter-active, .backdrop-leave-active {
  transition: opacity 250ms ease, backdrop-filter 250ms ease;
  will-change: opacity, backdrop-filter;
}

.backdrop-enter-from, .backdrop-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}

.backdrop-enter-to, .backdrop-leave-from {
  opacity: 1;
  backdrop-filter: blur(8px);
}

.panel-enter-active, .panel-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
  will-change: opacity, transform;
}

.panel-enter-from, .panel-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.panel-enter-to, .panel-leave-from {
  opacity: 1;
  transform: scale(1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}

.modal-body {
  width: 100%;
  height: 100%;
}
</style>
