<script setup lang="ts">
import {useTemplateRef} from "vue";
import Modal from "../Modal.vue";
import Button from "../StandardButton.vue";

interface Button {
  label: string;
  click?: Function;
}

defineProps<{
  buttons: Button[];
  title: string;
}>();

const baseModal = useTemplateRef('baseModal');

function setActive(active: boolean) {
  baseModal.value.setModalActive(active);
}

defineExpose({setActive});
</script>

<template>
  <Modal :title="title" ref="baseModal">
    <div class="dialogue-container">
      <slot/>
      <div class="buttons">
        <Button v-for="item in buttons" @click="item.click">
          {{item.label}}
        </Button>
      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.dialogue-container {
  padding: 0 18px 18px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
}
</style>