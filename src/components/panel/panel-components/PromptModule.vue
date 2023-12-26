<template>
    <div class="prompt-container">
        <p class="prompt-msg">{{props.msg}}</p>
        <div class="buttons">
            <ButtonArray v-for="item in props.buttons" :button="item" :key="item.label"/>
        </div>
    </div>
</template>

<script>
import ButtonArray from './ArrayButton.vue'

export default {
    props: ['props'],
    components: {
        ButtonArray
    }
}
</script>

<style scoped>
.prompt-container {
    padding: 10px 20px 15px;
    height: 100%;
}

.buttons {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
}

.prompt-msg {
    max-height: 225px;
    overflow: hidden;
    overflow-y: auto;
}

p {
    margin: 0;
}
</style>