<template>
    <label class="top-button" :for="checkFor">
        <i class="material-icons-outlined">{{button.icon}}</i>
        <span>{{button.name}}</span>
    </label>
</template>

<script>
export default {
    props: ['button'],
    computed: {
        checkFor(item) {
            if (item.button.for == null) {
                return
            }
            return item.button.for;
        }
    }
}
</script>

<style scoped>
.top-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: 20px;
}

.top-button:hover {
    color: var(--hl-txt);
    transform: scale(1.075);
}

.top-button i {
    font-size: 20px;
}

.top-button span {
    margin-left: 5px;
    font-size: 14px;
}

.top-button-container {
    display: flex;
}
</style>