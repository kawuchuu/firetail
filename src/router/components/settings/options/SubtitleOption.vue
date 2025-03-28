<script>
export default {
    name: "SubtitleOption.vue"
}
</script>

<template>
    <div class="subtitle"><slot /></div>
</template>

<style scoped lang="scss">
.subtitle {
    font-size: 1.45em;
    font-weight: 600;
    border-bottom: solid 1px var(--bd);
    padding-bottom: 10px;
    margin: 24px 0px 12px;
    letter-spacing: -0.02em;
}

.darwin .subtitle {
    letter-spacing: -0.01em;
}

.boldText {
    .subtitle {
        font-weight: bold;
    }
}
</style>