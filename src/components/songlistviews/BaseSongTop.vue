<script setup lang="ts">
import {onMounted, ref, Ref, watch} from "vue";

interface ListLengthNums {
  hours: number,
  minutes: number,
  seconds: number
}

const props = defineProps<{
  listName: string,
  listSize: number,
  artistName?: string,
  listLength?: number
}>();

const listLengthLabel:Ref<ListLengthNums> = ref({
  hours: 0,
  minutes: 0,
  seconds: 0,
});

function updateListLengthLabel() {
  listLengthLabel.value = {
    hours: Math.floor(props.listLength / 3600),
    minutes: Math.floor((props.listLength % 3600) / 60),
    seconds: Math.floor(props.listLength % 60)
  }
}

watch(() => props.listLength, updateListLengthLabel);
onMounted(() => {
  updateListLengthLabel();
})
</script>

<template>
  <div class="base-song-view">
    <h1 class="list-name">{{listName}}</h1>
    <div class="additional-info">
      <span v-if="artistName" class="icon-label"><i class="ft-icon">person</i>{{artistName}}</span>
      <span>{{ $t('TOP_TITLE.COUNT_TYPE_SONGS', listSize, { named: {count: $n(listSize) } })}}</span>
      <span>
        <span v-if="listLengthLabel.hours > 0">{{ $t('TOP_TITLE.LIST_LENGTH.HOURS', listLengthLabel.hours, { named: { count: $n(listLengthLabel.hours) } }) }}</span>
        <span v-if="listLengthLabel.minutes !== 0">{{ $t('TOP_TITLE.LIST_LENGTH.MINUTES', listLengthLabel.minutes, { named: { count: $n(listLengthLabel.minutes) } }) }}</span>
        <span v-if="listLengthLabel.hours < 1 && listLengthLabel.seconds !== 0">{{ $t('TOP_TITLE.LIST_LENGTH.SECONDS', listLengthLabel.seconds, { named: { count: $n(listLengthLabel.seconds) } }) }}</span>
      </span>
      <span class="worlds-egg" v-if="artistName === 'Porter Robinson' && (listName === 'Worlds' || listName === 'Worlds 10th Anniversary Edition')">【=◈︿◈=】</span>
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
  text-shadow: 0 0 80px var(--bg-op);
}

.additional-info {
  display: flex;
  align-items: center;

  span {
    font-size: 14px;
    opacity: 0.65;

    span {
      opacity: 1;
      margin-right: 5px;
    }
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

.additional-info span span:not(:last-child)::after {
  content: "";
  padding: 0px;
}

span.worlds-egg {
  font-family: sans-serif;
}
</style>