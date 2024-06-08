<script setup>
import SongItem from '../router/components/SongItem.vue'
import {ref} from "vue";
import { useRouter, useRoute } from 'vue-router/composables'

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
  <div class="wrapper">
    <virtual-list
        :data-key="'id'"
        :data-sources="list"
        :data-component="SongItem"
        :page-mode="true"
        :page-mode-el="'#main-container'"
        :extra-props="{selectedItems: selectedItems}"
        :estimate-size="itemSizeCheck"
        :keeps="40"
        ref="virtualList"
        @selected="select"
    />
  </div>
</template>

<style scoped lang="scss">

</style>