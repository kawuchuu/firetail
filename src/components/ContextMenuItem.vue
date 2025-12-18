<script setup lang="ts">

</script>

<template>
  <div class="context-menu-item">
    <i class="ft-icon icon">home</i>
    <span class="label">test</span>
  </div>
</template>

<style scoped lang="scss">
.context-menu-item {
  display: grid;
  grid-template-columns: 45px 1fr;
  grid-template-areas: 'icon label';
  align-items: center;
  padding: 6px 0;
  border-radius: 5px;
  cursor: pointer;
  gap: 4px;
}

.context-menu-item:hover {
  background: var(--bd);
}

.icon {
  grid-area: icon;
  align-self: center;
  justify-self: center;
}
</style>