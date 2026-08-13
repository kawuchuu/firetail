<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";

const props = defineProps<{
  icon?: string;
  title: string;
  message: string;
  autoDismissTime?: number;
  progressBar?: boolean;
  progressAmount?: number;
}>();

const animationTiming = computed(() => {
  return `animation-duration: ${props.autoDismissTime}ms`;
});

const notificationActive = ref(false);

let autoDismissTimeout = 0;

function dismiss() {
  notificationActive.value = false;
  clearTimeout(autoDismissTimeout);
}

onMounted(() => {
  notificationActive.value = true;
  if (props.autoDismissTime) {
    autoDismissTimeout = setTimeout(dismiss, props.autoDismissTime);
  }
})
</script>

<template>
  <div class="notification" :class="notificationActive ? 'active' : 'hidden'">
    <div v-if="autoDismissTime" class="indicator" :style="animationTiming" />
    <div class="dismiss" @click="dismiss">
      <i class="ft-icon std-icon-btn">close</i>
    </div>
    <div class="notification-inner">
      <h3>{{title}}</h3>
      <p>{{message}}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@keyframes indicator-anim {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

@keyframes notification-enter {
  from {
    transform: translateY(-70%);
  }
  to {
    transform: translateY(70%);
  }
}

@keyframes notification-exit {
  from {
    transform: translateY(70%);
  }
  to {
    transform: translateY(-70%);
  }
}

.notification {
  position: fixed;
  z-index: 10;
  right: 25px;
  transform: translateY(-70%);
  width: 300px;
  height: auto;
  background-color: var(--bg);
  border: solid 1px var(--bd);
  border-radius: 10px;
  padding: 16px 18px;
  overflow: hidden;
  animation: none;

  .dismiss {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  .notification-inner {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .indicator {
    width: 100%;
    height: 4px;
    background-color: var(--hl-txt);
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 20px;
  }

  h3, p {
    margin: 0;
  }

  h3 {
    font-weight: 600;
  }

  p {
    font-size: 0.9em;
  }
}

.notification.active {
  transform: translateY(70%);
  animation: notification-enter 0.75s cubic-bezier(0, 1, 0.35, 1);

  .indicator {
    animation: indicator-anim linear;
  }
}

.notification.hidden {
  animation: notification-exit 0.75s cubic-bezier(0, 1, 0.35, 1);
}
</style>