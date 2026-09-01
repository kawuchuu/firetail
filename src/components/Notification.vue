<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useNotification} from "../modules/useNotification";

const notificationHandle = useNotification();

const animationTiming = computed(() => {
  return `animation-duration: ${notificationHandle.autoDismissTime.value}ms`;
});

let autoDismissTimeout = 0;

function dismiss() {
  notificationHandle.notificationActive.value = false;
  clearTimeout(autoDismissTimeout);
}

watch(() => notificationHandle.notificationActive.value, (watchNew) => {
  if (watchNew && notificationHandle.autoDismissTime.value > 0) {
    autoDismissTimeout = setTimeout(dismiss, notificationHandle.autoDismissTime.value);
  }
})
</script>

<template>
  <div class="notification" :class="notificationHandle.notificationActive.value ? 'active' : 'hidden'">
    <div v-if="notificationHandle.autoDismissTime" class="indicator" :style="animationTiming" />
    <div class="dismiss" @click="dismiss">
      <i class="ft-icon std-icon-btn">close</i>
    </div>
    <div class="notification-inner">
      <h3>{{notificationHandle.title}}</h3>
      <p>{{notificationHandle.message}}</p>
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
  background-color: var(--fg-bg);
  border: solid 1px var(--bd);
  border-radius: 10px;
  padding: 16px 18px;
  overflow: hidden;
  animation: none;

  .dismiss {
    position: absolute;
    top: 12px;
    right: 12px;

    i {
      font-size: 1.35em;
    }
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