<script setup lang="ts">
import SongItem from '../router/components/SongItem.vue'
import {ref} from "vue";
import { useRouter, useRoute } from 'vue-router/composables'
import FiretailSong from "../types/FiretailSong";

const router = useRouter()

const props = defineProps({
  list: Array
})

const selectedItems = ref([])
const lastSelectedIndex = ref(0)

const itemSizeCheck = () => {
  if (.path === '/') {
    return 42
  } else {
    return 55
  }
}

</script>

<template>

</template>

<style scoped lang="scss">

</style>