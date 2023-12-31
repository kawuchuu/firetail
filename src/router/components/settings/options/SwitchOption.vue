<script>
export default {
    name: "SwitchOption",
    props: {
        label: String,
        initEnabled: Boolean,
        action: {
            default: () => {},
            type: Function
        },
        storeKey: {
            optional: true,
            type: String
        }
    },
    data() {
        return {
            enabled: this.initEnabled
        }
    },
    methods: {
        onClick() {
            this.enabled = !this.enabled
            if (this.storeKey) ftStore.setKey(this.storeKey, this.enabled)
            this.action(this.enabled)
        }
    }
}
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
    width: 45px;
    height: 14px;
    background-color: var(--text-op);
    border-radius: 50px;
    display: flex;
    align-items: center;
    transition-duration: 0.15s;
    transition-property: background-color;
    margin: 13px;
    margin-right: 0px;
    cursor: pointer;

    .circle-inner {
        width: 24px;
        height: 24px;
        border-radius: 50px;
        transition-duration: 0.15s;
        transition-property: transform, background-color, width;
        transform: translateX(0px);
        background-color: var(--text);
        box-shadow: 0px 1px 5px rgba(0,0,0,.25);
    }
}

.switch:active {
    .circle-inner {
        width: 30px;
    }
}

.switch.enabled {
    background-color: var(--hl-op);

    .circle-inner {
        background-color: var(--hl-txt);
        transform: translateX(21px);
    }
}

.switch.enabled:active {
    .circle-inner {
        transform: translateX(15px);
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