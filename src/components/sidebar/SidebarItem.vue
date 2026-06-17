<script setup lang="ts">
const props = defineProps<{
  icon: string,
  label: string,
  path: string | {name: string},
  bypassLabelLocale?: boolean
}>();
</script>

<template>
    <router-link :to="path">
      <div class="sidebar-item inner-outline">
        <i class="ft-icon">{{ icon }}</i>
        <span>{{ bypassLabelLocale ? label : $t(`SIDEBAR.${label}`) }}</span>
      </div>
    </router-link>
</template>

<style scoped lang="scss">
.sidebar-item {
    display: flex;
    width: 100%;
    height: 42px;
    align-items: center;
    opacity: 0.75;
    border-radius: 10px;
    background: transparent;
    transition: 0.1s;
    transition-property: background;
    position: relative;

    i {
        margin: 0 12px;
        pointer-events: none;
        font-size: 24px;
    }

  span {
    font-size: 15px;
  }
}

.sidebar-item:hover {
  opacity: 1;
}

.router-link-active .sidebar-item {
  background: var(--button);
  opacity: 1;
  font-weight: 600;
}

.sidebar-item::after {
  opacity: 0;
}

.router-link-active .sidebar-item::after {
  border-radius: 10px;
  opacity: 1;
}
</style>