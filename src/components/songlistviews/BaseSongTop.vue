<script setup lang="ts">
const props = defineProps<{
  listName: string,
  listSize: number,
  artistName?: string
}>()
</script>

<template>
  <div class="base-song-view">
    <h1 class="list-name">{{listName}}</h1>
    <div class="additional-info">
      <span v-if="artistName" class="icon-label"><i class="ft-icon">person</i>{{artistName}}</span>
      <span>{{ $t('TOP_TITLE.COUNT_TYPE_SONGS', listSize, { named: {count: $n(listSize) } })}}</span>
      <span>11 hrs 14 mins</span>
    </div>
  </div>
</template>

<style scoped>
.base-song-view {
  padding: 40px 55px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.list-name {
  font-size: 3em;
  margin: 0;
}

.additional-info {
  display: flex;
  align-items: center;

  span {
    font-size: 14px;
    opacity: 0.65;
  }

  span.icon-label {
    display: flex;
    align-items: center;
    opacity: 1;

    i {
      margin-right: 4px;
      font-size: 20px;
    }
  }

  span.icon-label:not(:last-child)::after {
    opacity: 0.65;
  }
}

.additional-info span:not(:last-child)::after {
  content: "\2022";
  padding: 0px 10px;
}
</style>