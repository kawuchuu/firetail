<script setup lang="ts">
import {ModelRef} from "vue";

const model: ModelRef<string | undefined> = defineModel();

defineProps<{
  textArea?: boolean;
}>();
</script>

<template>
  <textarea v-if="textArea" v-model="model" />
  <input v-else v-model="model" type="text" />
</template>

<style scoped lang="scss">
input[type=text], textarea {
  border: none;
  background: var(--sub-fg);
  padding: 10px 15px;
  height: 20px;
  color: var(--text);
  font-family: 'Figtree', sans-serif;
  border-radius: 10px;
  outline: none;
  font-size: inherit;
}

textarea {
  resize: none;
  height: 80px;
}

input::placeholder, textarea::placeholder {
  color: var(--text);
  opacity: 0.5;
}

input:focus, textarea:focus {
  background: var(--fg-bg);
}
</style>