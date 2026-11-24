<script setup lang="ts">
defineProps<{
  icon?: string;
  appearance?: string;
  type?: 'button' | 'submit' | 'reset';
}>();
</script>

<template>
    <button :type="type ?? 'button'" class="button" :class="appearance">
        <i v-if="icon" class="ft-icon">{{ icon }}</i>
        <span><slot/></span>
    </button>
</template>

<style lang="scss" scoped>
.button {
    appearance: none;
    box-sizing: content-box;
    height: 20px;
    display: inline-flex;
    align-items: center;
    padding: 10px 15px;
    border: none;
    background: transparent;
    font: inherit;
    color: var(--hl-txt);
    border-radius: 10px;
    width: auto;

    span {
        font-weight: 600;
    }

    i {
        margin-right: 10px;
    }
}

.boldText .button span {
    font-weight: bold;
}

.button:hover {
    background-color: var(--hl-op);
    box-shadow: inset 0 0 0 1px var(--bd-op);
}

.button:active {
    background-color: var(--hl-op);
    box-shadow: inset 0 0 0 1px var(--bd-op);
    opacity: 0.5;
}

.button:focus-visible {
    outline: 2px solid var(--hl-txt);
    outline-offset: 2px;
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
