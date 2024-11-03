<script>
import PointingArrow from "./PointingArrow.vue";
import TourSheet from "./TourSheet.vue";

export default {
  name: "SidebarTour",
  components: {TourSheet, PointingArrow}
}
</script>

<template>
<div class="sidebar-tour">
  <div class="tour-guide-block">
    <div class="to-block main"></div>
    <div class="to-block bottom"></div>
  </div>
  <PointingArrow class="pa-1" :pointing="'left'"/>
  <TourSheet class="ts-1">
    <h1>Sidebar</h1>
    <p>This is the main sidebar. Use these buttons to navigate throughout the app.</p>
  </TourSheet>
</div>
</template>

<style scoped lang="scss">
.to-block.main {
  width: calc(100vw - var(--sidebar-width));
  height: 100vh;
  right: 0;
}
.to-block.bottom {
  width: calc(var(--sidebar-width) + 50px);
  height: 85px;
  bottom: 0;
  left: 0;
}
.pa-1 {
  position: fixed;
  top: 200px;
  left: calc(var(--sidebar-width) + 20px);
}
.ts-1 {
  top: 180px;
  left: calc(var(--sidebar-width) + 80px);
}
</style>