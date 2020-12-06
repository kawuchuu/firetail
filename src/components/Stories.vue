<template>
    <div class="item-wrapper">
        <div class="story-item">
            <div :style="getBg" class="img"></div>
        </div>
        <p>{{story.name}}</p>
    </div>
</template>

<script>
export default {
    props: ['story'],
    computed: {
        getBg() {
            return `background-image: url('${this.story.img}')`
        }
    }
}
</script>

<style lang="scss" scoped>
.item-wrapper {
    width: 110px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-right: 20px;

    p {
        margin: 10px 0;
        font-size: 14px;
    }

    .story-item {
        width: 75px;
        height: 75px;
        border-radius: 100px;
        background: linear-gradient(var(--gradient1), var(--gradient2));
        display: flex;
        align-items: center;
        justify-content: center;

        div {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            width: 63px;
            height: 63px;
            border: solid 3px var(--bg);
            border-radius: 100px;
        }
    }
}
</style>