<template>
    <div class="markdown-container" :class="finishedLoading ? '' : 'loading'" ref="markdown">
        <div class="load-spinner" />
    </div>
</template>

<script>
import {marked} from "marked";
export default {
    name: "MarkdownModule",
    props: ['props'],
    data() {
        return {
            finishedLoading: false
        }
    },
    async mounted() {
        console.log(this.props)
        this.$nextTick(async () => {
            this.$refs.markdown.innerHTML = await window.marked.parse(this.props.file)
            this.finishedLoading = true
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
    user-select: text;

    ul li {
        margin: 10px 0;
    }

    h1, h2, h3 {
        font-weight: 600;
        letter-spacing: -0.02em;
    }

    a {
        pointer-events: none;
    }
}

.markdown-container.loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}
</style>