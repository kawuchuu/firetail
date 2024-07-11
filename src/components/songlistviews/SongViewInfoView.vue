<script setup lang="ts">

</script>

<template>
  <div class="info-view">
    <div class="album-art">
      <img src="../../assets/no_album.svg" alt="Album art"/>
    </div>
  </div>
</template>

<style scoped>
.info-view {
  width: 100%;
  height: 100%;
}

.album-art {
  width: auto;
  height: auto;
  padding: 40px;

  img {
    background: var(--back-bg);
    width: 100%;
    height: 100%;
  }
}
</style>