<script setup lang="ts">
import {ContextMenuItemType} from "../types/Common";

defineProps<{
  label?: string,
  icon?: string,
  type?: ContextMenuItemType,
}>();
</script>

<template>
  <div v-if="type === ContextMenuItemType.DIVIDER" class="divider" />
  <div v-else class="context-menu-item">
    <i class="ft-icon icon">{{icon}}</i>
    <span class="label">{{label}}</span>
  </div>
</template>

<style scoped lang="scss">
.context-menu-item {
  display: grid;
  grid-template-columns: 34px 1fr;
  grid-template-areas: 'icon label';
  align-items: center;
  padding: 6px 0;
  border-radius: 5px;
  gap: 2px;
}

.context-menu-item:hover {
  background: var(--bd);

  .icon {
    opacity: 1;
  }
}

.label {
  font-size: 14px;
  margin-right: 18px;
}

.icon {
  grid-area: icon;
  align-self: center;
  justify-self: center;
  font-size: 20px;
  opacity: 0.5;
}

.divider {
  width: 100%;
  height: 1px;
  background: var(--bd);
  margin: 6px 0;
}
</style>