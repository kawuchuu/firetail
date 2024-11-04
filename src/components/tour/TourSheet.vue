<script>
import StandardButton from "../StandardButton.vue";

export default {
  name: "TourSheet" ,
  components: {StandardButton},
  methods: {
    next() {
      this.advancePart();
    },
    prev() {
      this.backPart();
    }
  },
  inject: ['part', 'advancePart', 'backPart'],
}
</script>

<template>
  <div class="tour-sheet">
    <div class="tour-inner">
      <slot />
      <div class="buttons">
        <StandardButton class="button-right" :button="{label: 'Back', onClick: prev}"></StandardButton>
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

  top: 0;
  left: 0;
  right: 0;
  bottom: inherit;

  transition: 0.5s cubic-bezier(0, 1, 0.35, 1);
  transition-property: width, height, top, left, right, bottom;
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