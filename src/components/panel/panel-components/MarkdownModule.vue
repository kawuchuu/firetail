<template>
    <div class="markdown-container" ref="markdown"></div>
</template>

<script>
import {marked} from "marked";
export default {
    name: "MarkdownModule",
    async mounted() {
        this.$nextTick(async () => {
            this.$refs.markdown.innerHTML = await window.marked.parse('changelog.md')
        })
    }
}
</script>

<style lang="scss">
.markdown-container {
    padding: 0 20px 15px;
    height: 500px;
    overflow: hidden;
    overflow-y: auto;

    ul li {
        margin: 10px 0;
    }
}
</style>