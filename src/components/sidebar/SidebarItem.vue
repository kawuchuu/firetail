<script setup lang="ts">
const props = defineProps({
    icon: String,
    label: String
})
</script>

<template>
    <div class="sidebar-item">
        <i class="ft-icon">{{ icon }}</i>
        <span>{{ $t(`SIDEBAR.${label}`) }}</span>
    </div>
</template>

<style scoped lang="scss">
.sidebar-item {
    display: flex;
    width: 100%;
    height: 42px;
    align-items: center;
    cursor: pointer;
    opacity: 0.75;
    border-radius: 10px;
    background: transparent;
    transition: 0.1s;
    transition-property: background;

    i {
        margin: 0 12px;
        pointer-events: none;
        font-size: 24px;
    }
}
</style>