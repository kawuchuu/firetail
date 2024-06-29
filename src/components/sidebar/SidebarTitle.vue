<script setup lang="ts">
const props = defineProps({
    title: String
})
</script>

<template>
    <div class="list-subtitle">{{ $t(`SIDEBAR.${title}`) }}</div>
</template>

<style scoped>
.list-subtitle {
    font-size: 15px;
    opacity: .75;
    margin: 22px 0 5px 16px;
    padding-bottom: 10px;
    padding-left: 15px;
    border-bottom: 1px solid var(--text);
    transform: translateX(-15px);
    width: calc(100% - 17px);
}
</style>