<script>
export default {
    name: "TextOption.vue"
}
</script>

<template>
    <p class="text"><slot /></p>
</template>

<style scoped lang="scss">
.text {
    margin-top: 0px;
    font-size: 12px;
    opacity: 0.5;
}
</style>