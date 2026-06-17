<script setup lang="ts">
import {onBeforeMount, ref} from "vue";

const props = defineProps<{
    label: string,
    action: Function,
    storeKey: string,
    storeCategory: string,
}>();

const enabled = ref(false);

function onClick() {
    enabled.value = !enabled.value;
    if (props.storeKey) window.ftStore.setKey(props.storeKey, enabled.value, props.storeCategory);
    switch(props.storeCategory) {
        case "class":
            if (enabled.value) {
                document.documentElement.classList.add(props.storeKey);
            } else {
                document.documentElement.classList.remove(props.storeKey);
            }
            break;
        case "switchVx": {
            //this.$store.commit(`nav/${this.storeKey}`, this.enabled)
        }
    }
    props.action(enabled.value);
}

onBeforeMount(() => {
    if (props.storeKey && window.ftStoreSync.keyExists(props.storeKey)) {
        const result = window.ftStoreSync.getItem(props.storeKey)
        if (typeof result === "boolean" && result) {
            enabled.value = true
        }
    }
})
</script>

<template>
    <div class="switch-option" @click="onClick">
        <p>{{label}}</p>
        <div class="switch inner-outline" :class="enabled ? 'enabled' : ''">
            <div class="circle-inner" />
        </div>
        <div class="highlight" />
    </div>
</template>

<style scoped lang="scss">
.switch-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    width: 100%;
    height: 100%;
    position: relative;

    p {
        margin: 0;
    }
}

.highlight {
  position: absolute;
  width: calc(100% + 20px);
  height: 100%;
  transform: translateX(-10px) scale(0.99);
  background: #ffffff10;
  outline: solid 1px var(--bd);
  border-radius: 10px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.15s, transform 0.3s, width 0.3s, background 0.3s;
}

.switch-option:hover .highlight {
  transform: translateX(-10px) scale(1);
  opacity: 1;
}

.switch-option:active .highlight {
  transform: translateX(-8px) scale(1.01);
  opacity: 1;
  background: var(--bd);
  width: calc(100% + 16px);
}

.switch {
    width: 54px;
    height: 30px;
    background-color: var(--button);
    border-radius: 50px;
    display: flex;
    align-items: center;
    transition-duration: 0.15s;
    transition-property: background-color;
    margin: 4px 0 4px 4px;
    overflow: hidden;
    position: relative;

    .circle-inner {
        width: 24px;
        height: 24px;
        border-radius: 50px;
        transition-duration: 0.15s;
        transition-property: transform, background-color, width;
        transform: translateX(3px);
        background-color: color-mix(in srgb, var(--text) 55%, transparent);
        box-shadow: 0 2px 6px rgba(0,0,0,.6);
    }
}

.switch::after {
  border-radius: 50px;
}

.switch-option:active .switch {
    .circle-inner {
        width: 30px;
    }
}

.switch-option .switch.enabled {
    background-color: var(--hl-txt);

    .circle-inner {
        background-color: var(--text);
        transform: translateX(27px);
    }
}

.switch-option:active .switch.enabled {
    .circle-inner {
        transform: translateX(21px);
    }
}

.rtl {
    .switch-option .switch.enabled {
        .circle-inner {
            transform: translateX(-21px);
        }
    }
    .switch-option:active .switch.enabled {
        .circle-inner {
            transform: translateX(-15px);
        }
    }
}
</style>