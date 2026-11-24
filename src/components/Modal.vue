<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref, useId, useTemplateRef, watch} from 'vue';

const open = defineModel<boolean>('open', {default: false});

defineProps<{
  title: string;
}>();

const CLOSE_DURATION = 250;

const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const titleId = useId();
const contentRendered = ref(open.value);
let unrenderTimer: ReturnType<typeof setTimeout> | null = null;
let pointerDownOnBackdrop = false;

function show() {
  if (unrenderTimer) clearTimeout(unrenderTimer);
  unrenderTimer = null;
  contentRendered.value = true;
  if (dialog.value && !dialog.value.open) dialog.value.showModal();
}

function hide() {
  if (dialog.value?.open) dialog.value.close();
  if (unrenderTimer) clearTimeout(unrenderTimer);
  unrenderTimer = setTimeout(() => {
    unrenderTimer = null;
    if (!open.value) contentRendered.value = false;
  }, CLOSE_DURATION);
}

function onClose() {
  open.value = false;
}

function onPointerDown(e: PointerEvent) {
  pointerDownOnBackdrop = e.target === dialog.value;
}

function onClick(e: MouseEvent) {
  if (pointerDownOnBackdrop && e.target === dialog.value) open.value = false;
  pointerDownOnBackdrop = false;
}

watch(open, value => value ? show() : hide());

onMounted(() => {
  if (open.value) show();
});

onBeforeUnmount(() => {
  if (unrenderTimer) clearTimeout(unrenderTimer);
  if (dialog.value?.open) dialog.value.close();
});
</script>

<template>
  <teleport to="body">
    <dialog
      ref="dialog"
      class="modal"
      :aria-labelledby="titleId"
      @close="onClose"
      @pointerdown="onPointerDown"
      @click="onClick"
    >
      <div class="modal-header">
        <h3 :id="titleId">{{title}}</h3>
        <button type="button" class="close-btn ft-icon" :aria-label="$t('BUTTONS.CLOSE')" @click="open = false">close</button>
      </div>
      <div class="modal-body">
        <slot v-if="contentRendered" />
      </div>
    </dialog>
  </teleport>
</template>

<style scoped lang="scss">
.modal {
  box-sizing: border-box;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  padding: 0;
  border: 1px solid var(--bd);
  border-radius: 10px;
  background-color: var(--bg);
  color: inherit;
  overflow: hidden;
  flex-direction: column;
  user-select: none;

  opacity: 0;
  transform: scale(0.98);
  transition:
    opacity 250ms ease,
    transform 250ms ease,
    overlay 250ms ease allow-discrete,
    display 250ms ease allow-discrete;
}

.modal[open] {
  display: flex;
  opacity: 1;
  transform: scale(1);
}

@starting-style {
  .modal[open] {
    opacity: 0;
    transform: scale(0.98);
  }
}

.modal::backdrop {
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(0);
  transition:
    background 250ms ease,
    backdrop-filter 250ms ease,
    overlay 250ms ease allow-discrete,
    display 250ms ease allow-discrete;
}

.modal[open]::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

@starting-style {
  .modal[open]::backdrop {
    background: rgba(0, 0, 0, 0);
    backdrop-filter: blur(0);
  }
}

.modal:focus-visible {
  outline: none;
}

.modal-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
}

.close-btn {
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  color: inherit;
  opacity: 0.7;
  border-radius: 6px;
}

.close-btn:hover {
  opacity: 1;
}

.close-btn:active {
  opacity: 1;
  color: var(--hl-txt);
}

.close-btn:focus-visible {
  opacity: 1;
  outline: 2px solid var(--hl-txt);
  outline-offset: 2px;
}

.modal-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
</style>
