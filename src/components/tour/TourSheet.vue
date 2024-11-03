<script>
import StandardButton from "../StandardButton.vue";

export default {
  name: "TourSheet" ,
  components: {StandardButton},
  methods: {
    next() {
      this.$store.commit('nav/updateTourMode', false)
    }
  }
}
</script>

<template>
  <div class="tour-sheet">
    <div class="tour-inner">
      <slot />
      <div class="buttons">
        <StandardButton class="button-right" :button="{label: 'Back'}"></StandardButton>
        <StandardButton class="button-right" :button="{label: 'Next', style: 'primary', onClick: next}"></StandardButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tour-sheet {
  width: 250px;
  height: auto;
  background: var(--bg);
  border: 1px solid var(--bd);
  border-radius: 10px;

  position: fixed;
  pointer-events: all;
}

.tour-inner {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  padding: 20px;

  h1 {
    margin-top: 0;
    font-size: 1.5em;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
}
.buttons {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  pointer-events: all;
  gap: 10px;
}

</style>