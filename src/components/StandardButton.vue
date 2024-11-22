<template>
    <div class="wrapper">
        <div class="button" @click="doOnClick" :class="button.style">
            <i v-if="button.icon" class="ft-icon">{{ button.icon }}</i>
            <span>{{ button.label }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['button'],
    name: 'Button',
    methods: {
        doOnClick() {
            if (this.button.onClick) this.button.onClick()
        }
    }
}
</script>

<style lang="scss" scoped>
.button {
    height: 20px;
    display: flex;
    align-items: center;
    padding: 10px 15px;
    color: var(--hl-txt);
    border-radius: 10px;
    width: auto;
    cursor: pointer;
    //margin: 0px 8px;

    span {
        font-weight: 600;
        //text-transform: uppercase;
    }

    i {
        margin-right: 10px;
    }
}

.boldText .button span {
    font-weight: bold;
}

.button:last-child {
    margin-right: 0px;
}

.button:hover {
    background-color: var(--hl-op)
}

.button:active {
    background-color: var(--hl-op);
    opacity: 0.5;
}

.button.primary {
    background: var(--hl-txt);
    color: black;
    transition: 0.08s;
    transition-property: transform, text-shadow;
}

:root.light .button.primary {
    color: white;
}

.button.primary:hover {
    transform: scale(1.08);
    box-shadow: 0px 2px 10px rgba(0,0,0,.5);
}

.button.primary:active {
    transform: scale(1);
}
</style>
