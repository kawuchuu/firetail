<script setup lang="ts">
import Modal from "../Modal.vue";
import StandardButton from "../StandardButton.vue";

interface DialogueButton {
  label: string;
  click?: () => void;
  appearance?: string;
}

const open = defineModel<boolean>('open', {default: false});

defineProps<{
  buttons: DialogueButton[];
  title: string;
}>();
</script>

<template>
  <Modal v-model:open="open" :title="title">
    <div class="dialogue-container">
      <slot/>
      <div class="buttons">
        <StandardButton
          v-for="item in buttons"
          :key="item.label"
          :appearance="item.appearance"
          @click="item.click?.()"
        >
          {{item.label}}
        </StandardButton>
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
