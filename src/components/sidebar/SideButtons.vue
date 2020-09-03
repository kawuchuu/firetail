<template>
    <router-link :to="button.link" v-if="button.type == 'large_button'">
        <div class="item-sidebar">
            <div class="active-indicator"></div>
            <i class="material-icons-outlined">{{ button.icon }}</i>
            <span>{{ button.name }}</span>
        </div>
    </router-link>
    <div class="list-subtitle" v-else-if="button.type == 'subtitle'" v-on:click="test">{{ button.name }}</div>
    <div v-else class="item-sidebar playlist-sidename" v-on:click="test">
        <div class="active-indicator"></div>
        <span>{{ button.name }}</span>
    </div>
</template>

<script>
export default {
    props: ['button'],
    methods: {
        test() {
            console.log('different')
        }
    }
}
</script>