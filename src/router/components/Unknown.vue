<template>
    <div class="root">
        <h1>This component is currently unavailable.</h1>
        <p>Current path: {{path}}</p>
    </div>
</template>

<script>
export default {
    computed: {
        path() {
            return this.$route.fullPath
        }
    },
    mounted() {
        this.$store.commit('nav/updateTopVisible', false)
    }
}
</script>

<style lang="scss" scoped>
.root {
    padding: 45px;

    p, h1 {
        margin: 0 0 20px;
    }
}
</style>