<script setup lang="ts">
const props = defineProps<{
  listName: string,
  listSize: number
}>()
</script>

<template>
  <div class="base-song-view">
    <h1 class="list-name">{{listName}}</h1>
    <div class="additional-info">
      <span>{{ $t('TOP_TITLE.COUNT_TYPE_SONGS', { count: listSize })}}</span>
      <span>11 hrs 14 mins</span>
    </div>
    <div class="bg-gradient">
      <div class="list-gradient-fade" />
      <div class="bg-fade-bottom" />
      <div class="bg-noise" />
      <div class="bg-banner" />
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
  }
}

.additional-info span:not(:last-child)::after {
  content: "\2022";
  padding: 0px 10px;
}

.bg-gradient {
  position: absolute;
  width: calc(100% + 20px);
  height: 600px;
  top: 0;
  left: -20px;
  z-index: -1;
}

.list-gradient-fade {
  width: 100%;
  height: 600px;
  position: absolute;
}

.bg-fade-bottom {
  width: 100%;
  height: 400px;
  background: var(--bg);
  position: absolute;
  top: 420px;
  z-index: 2;
}

.bg-banner {
  opacity: 0.75;
}
</style>