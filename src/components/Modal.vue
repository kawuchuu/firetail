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
  <teleport v-if="modalActive" to="body">
    <div class="modal-container">
      <div class="modal">
        <div class="modal-header">
          <h3>{{title}}</h3>
          <i @click="setModalActive(false)" class="ft-icon">close</i>
        </div>
        <div class="modal-body">
          <slot/>
        </div>
      </div>
      <div class="bg" @click="setModalActive(false)" />
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.modal-container {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 20;

  display: flex;
  justify-content: center;
  align-items: center;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bg {
  width: 100%;
  height: 100%;
  position: absolute;
  background: rgba(0,0,0,.5);
  animation: fade-in 250ms;
  backdrop-filter: blur(8px);
}

@keyframes open {
  from {
    transform: scale(0.98);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal {
  max-width: 600px;
  width: 90%;
  max-height: 80%;
  border-radius: 10px;
  background-color: var(--bg);
  border: solid 1px var(--bd);
  position: relative;
  z-index: 21;
  animation: open 250ms;
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