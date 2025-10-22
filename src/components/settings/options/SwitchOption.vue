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
    <div class="switch-option">
        <p>{{label}}</p>
        <div class="switch" :class="enabled ? 'enabled' : ''" @click="onClick">
            <div class="circle-inner" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.switch-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0px;

    p {
        margin: 0;
    }
}

.switch {
    width: 54px;
    height: 30px;
    background-color: var(--fg-bg);
    box-shadow: inset 0 0 0 1px var(--bd-op);
    border-radius: 50px;
    display: flex;
    align-items: center;
    transition-duration: 0.15s;
    transition-property: background-color;
    margin: 4px 0 4px 4px;
    cursor: pointer;
    overflow: hidden;

    .circle-inner {
        width: 24px;
        height: 24px;
        border-radius: 50px;
        transition-duration: 0.15s;
        transition-property: transform, background-color, width;
        transform: translateX(3px);
        background-color: var(--text);
        box-shadow: 0 2px 6px rgba(0,0,0,.6);
    }
}

.switch:active {
    .circle-inner {
        width: 30px;
    }
}

.switch.enabled {
    background-color: var(--hl-txt);

    .circle-inner {
        //background-color: var(--hl-txt);
        transform: translateX(27px);
    }
}

.switch.enabled:active {
    .circle-inner {
        transform: translateX(21px);
    }
}

.rtl {
    .switch.enabled {
        .circle-inner {
            transform: translateX(-21px);
        }
    }
    .switch.enabled:active {
        .circle-inner {
            transform: translateX(-15px);
        }
    }
}
</style>