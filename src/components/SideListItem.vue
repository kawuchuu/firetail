<script setup lang="ts">
defineProps<{
  title: string;
  url: string;
  subtitle?: string;
  imagePath?: string;
  circleImage?: boolean;
}>();
</script>

<template>
  <div class="list-items">
    <router-link :to="url">
      <img alt="" loading="lazy" :class="['item-img', circleImage ? 'circle' : '']" :src="imagePath ?? imagePath"/>
      <div class="item-info">
        <span class="title">{{ title }}</span>
        <span v-if="subtitle" class="album-artist">{{ subtitle }}</span>
      </div>
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.list-items {
  height: 63px;
  border-radius: 10px;
}

.list-items a span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.65;
  padding-right: 10px;
}

.router-link-exact-active {
  background-color: var(--button);
  border-radius: 10px;
  cursor: default;
  box-shadow: inset 0 0 0 1px var(--bd-op);
}

.list-items a.router-link-exact-active .title {
  opacity: 1;
  font-weight: 600;
}

.list-items a.router-link-exact-active .album-artist {
  opacity: 1;
}

.list-items a {
  display: flex;
  align-items: center;
  height: 100%;
  border-radius: 10px;
}

.item-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: transparent !important;

  .title {
    font-size: 0.95em;
    margin-left: 6px;
  }

  .album-artist {
    font-size: 0.8em;
    margin-top: 5px;
    font-weight: normal !important;
    margin-left: 6px;
  }
}

.list-items:hover {
  a span {
    opacity: 1;
  }
}

.item-img {
  min-width: 45px;
  min-height: 45px;
  max-width: 45px;
  max-height: 45px;
  margin: 0px 9px;
  background-color: var(--back-bg);
  border-radius: 3px;
  background-image: url('../assets/no_album.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.item-img.circle {
  border-radius: 100%;
  background-image: url('../assets/no_artist.svg');
}
</style>