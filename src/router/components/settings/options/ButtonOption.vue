<script>
export default {
    name: "ButtonOption.vue",
    props: {
        label: String,
        btnLabel: String,
        action: {
            default: () => {},
            type: Function
        }
    }
}
</script>

<template>
    <div class="button-option">
        <p>{{label}}</p>
        <div @click="action" class="button" role="button" tabindex="0" :aria-label="`${label}. ${btnLabel}`">{{btnLabel}}</div>
    </div>
</template>

<style scoped lang="scss">
.button-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0px;

    p {
        margin: 0;
    }

    .button {
        height: 20px;
        display: flex;
        align-items: center;
        padding: 10px 15px;
        color: var(--hl-txt);
        border-radius: 10px;
        width: auto;
        //text-transform: uppercase;
        font-weight: 600;
        cursor: pointer;
    }

    .button span {
        font-weight: 600;
        text-transform: uppercase;
    }

    .button:hover {
        background-color: var(--hl-op)
    }

    .button:active {
        background-color: var(--hl-op);
        opacity: 0.5;
    }
}
</style>