<template>
  <div class="subtitle">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.subtitle {
    font-size: 1.45em;
    font-weight: 600;
    border-bottom: solid 1px var(--bd);
    padding-bottom: 10px;
    margin: 24px 0 12px;
}
</style>