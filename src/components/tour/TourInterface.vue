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
    <component class="active-tour" :is="currentTour"></component>
    <div class="dark-bg"></div>
  </div>
</template>

<style>
@keyframes fade-in-highlight-tour {
  from {
    backdrop-filter: brightness(2.25) opacity(0);
    opacity: 0;
  }
  to {
    backdrop-filter: brightness(2.25) opacity(1);
    opacity: 1;
  }
}
.highlight-tour {
  backdrop-filter: brightness(2.25) opacity(1);
  border-radius: 10px;
  border: solid 2px var(--text-op);
  animation: fade-in-highlight-tour 1s;
  position: fixed;
  margin: 8px;
  transition: 0.5s cubic-bezier(0, 1, 0.35, 1);
  transition-property: width, height, top, left, right, bottom;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 10px rgba(0,0,0,.25);
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
}
.dark-bg {
  width: 100%;
  height: 100%;
  position: fixed;
  //background: rgba(0,0,0,.5);
  backdrop-filter: brightness(0.5);
  z-index: 99;
  animation: showTourMode 1s;
}
.active-tour {
  position: inherit;
  z-index: 100;
}
</style>