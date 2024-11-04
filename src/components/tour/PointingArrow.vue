<script>
export default {
  name: "PointingArrow",
  props: {
    pointing: String
  },
  computed: {
    point() {
      switch(this.pointing) {
        case "left": {
          return 'arrow_back'
        }
        case "right": {
          return 'arrow_forward'
        }
        case "up": {
          return 'arrow_upward'
        }
        case "down": {
          return 'arrow_downward'
        }
        default: {
          return 'arrow_back'
        }
      }
    }
  }
}
</script>

<template>
  <i class="material-icons-rounded arrow" :class="pointing">{{point}}</i>
</template>

<style scoped lang="scss">
.arrow {
  font-size: 40px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  transition: 0.5s cubic-bezier(0, 1, 0.35, 1);
  transition-property: top, left, right, bottom;
}

@keyframes up-down {
  from {
    transform: translateY(-5px);
  }
  to {
    transform: translateY(5px);
  }
}

@keyframes left-right {
  from {
    transform: translateX(-5px);
  }
  to {
    transform: translateX(5px);
  }
}

.left, .right {
  animation: left-right 1s infinite ease-in-out alternate-reverse;
}

.up, .down {
  animation: up-down 1s infinite ease-in-out alternate-reverse;
}
</style>