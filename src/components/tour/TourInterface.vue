<script>
export default {
  name: "TourInterface",
  data() {
    return {
      currentTour: null
    }
  },
  methods: {
    setNewTour(name) {
      const comp = require(`./${name}`).default;
      console.log(comp);
      this.currentTour = comp;
    }
  },
  mounted() {
    this.setNewTour('SidebarTour.vue');
  }
}
</script>

<template>
  <div class="tour">
    <component :is="currentTour"></component>
  </div>
</template>

<style>
.tour-guide-block {
  opacity: 0.5;
}
.to-block {
  background: black;
  pointer-events: all;
  position: fixed;
}
</style>

<style scoped lang="scss">
@keyframes showTourMode {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.tour {
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 99;
  pointer-events: none;
  animation: showTourMode 1s;
}
</style>