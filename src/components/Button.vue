<template>
    <div class="wrapper">
        <div v-if="!button.onClick" class="button">
            <i v-if="button.icon" class="material-icons-outlined">{{ button.icon }}</i>
            <span>{{ button.label }}</span>
        </div>
        <div v-else class="button" @click="button.onClick">
            <i v-if="button.icon" class="material-icons-outlined">{{ button.icon }}</i>
            <span>{{ button.label }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['button'],
    name: 'Button'
}
</script>

<style scoped>
    .button {
        height: 20px;
        display: flex;
        align-items: center;
        padding: 10px 15px;
        color: var(--hl-txt);
        border-radius: 10px;
        width: auto;
        cursor: pointer;
    }
    .button span {
        font-weight: bold;
        text-transform: uppercase;
    }
    .button i {
        margin-right: 10px;
    }
    .button:hover {
        background-color: var(--hl-op)
    }
    .button:active {
        background-color: var(--hl-op);
        opacity: 0.5;
    }
</style>