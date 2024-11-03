<script>
import StandardButton from "../../StandardButton.vue";
export default {
  name: "Welcome",
  components: {
    StandardButton,
  },
  methods: {
    close() {
      this.$store.commit('panel/updateActive', false)
    },
    startTour() {
      this.close()
      this.$store.commit('nav/updateTourMode', true)
    }
  }
}
</script>

<template>
  <div class="welcome">
    <img class="firetail-welcome" src="../../../assets/firetail.png" />
    <h1>Welcome to Firetail</h1>
    <p>Would you like a tour to show you around?</p>
    <div class="buttons">
      <StandardButton class="button-right" :button="{label: 'No thanks', onClick: close}"></StandardButton>
      <StandardButton class="button-right" :button="{label: 'Start tour', style: 'primary', onClick: startTour}"></StandardButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.welcome {
  padding: 10px 20px 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateY(-25px);
  pointer-events: none;
}

.firetail-welcome {
  width: 120px;
  height: 120px;
}

.buttons {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  gap: 10px;
}

h1 {
  margin-bottom: 0;
  font-weight: 600;
  letter-spacing: -0.01em;
}
</style>