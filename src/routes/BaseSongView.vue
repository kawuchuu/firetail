<script setup lang="ts">
const props = defineProps<{
  isTopOrBottom: string
}>();
</script>

<template>
  <div class="base-song-view">
    <div v-if="isTopOrBottom === 'top'" class="top-section">
      <h1>This is the top of the base song view!</h1>
    </div>
    <div v-else-if="isTopOrBottom === 'bottom'" class="bottom-section">
      <h1>This is the bottom of the base song view!</h1>
    </div>
  </div>
</template>

<style scoped>

</style>