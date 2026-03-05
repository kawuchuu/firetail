<script setup lang="ts">
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";

const route = useRoute();
const icon = ref("note");

onMounted(() => {
  switch(route.path) {
    case "/albums":
      icon.value = "album";
      break;
    case "/artists":
      icon.value = "person";
      break;
    default:
      icon.value = "note";
      break;
  }
})
</script>

<template>
  <div class="blank">
    <i class="ft-icon">{{icon}}</i>
  </div>
</template>

<style scoped>
.blank {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

i.ft-icon {
  font-size: 6.5em;
  color: var(--bd);
}
</style>