<script setup lang="ts">
const props = defineProps({
    icon: String,
    label: String,
  path: String
})
</script>

<template>
    <router-link :to="path">
      <div class="sidebar-item">
        <i class="ft-icon">{{ icon }}</i>
        <span>{{ $t(`SIDEBAR.${label}`) }}</span>
      </div>
    </router-link>
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
  box-shadow: inset 0 0 0 1px var(--bd-op);
}
</style>