<template>
    <router-link draggable="false" :to="button.link" v-if="button.type == 'large_button'" role="tab" :aria-label="button.name">
        <div class="item-sidebar">
            <i class="ft-icon">{{ button.icon }}</i>
            <span>{{ button.name }}</span>
        </div>
    </router-link>
    <div class="list-subtitle" v-else-if="button.type == 'subtitle'">{{ button.name }}</div>
    <div v-else-if="button.type == 'special_button'" class="special-button" @click="doAction">
        <i class="ft-icon">{{ button.icon }}</i>
        <span>{{ button.name }}</span>
    </div>
</template>

<script>
export default {
    props: ['button'],
    methods: {
        doAction() {
            if (this.button.action) this.button.action()
        }
    }
}
</script>