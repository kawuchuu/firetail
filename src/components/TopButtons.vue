<template>
    <div class="root">
        <label @click="click" class="top-button" :for="checkFor">
            <i class="material-icons-outlined">{{button.icon}}</i>
            <span>{{button.name}}</span>
        </label>
    </div>
</template>

<script>
import store from '../store'

export default {
    props: ['button'],
    computed: {
        checkFor(item) {
            if (item.button.for == null) {
                return
            }
            return item.button.for;
        }
    },
    methods: {
        click() {
            switch(this.button.id) {
                case "removeLibrary":
                    this.$store.commit('panel/showNewPrompt', {title: 'Remove Library', message: "Are you sure you want to remove your current library? Your music files will not be removed.", buttons: 'clearLibrary'})
                    break;
                case "test":
                    this.$store.commit('panel/updatePanelProps', {
                        topMsg: 'Spotify Integration',
                        buttons: [
                            {
                                label: 'Next',
                                onClick() {
                                    store.commit('panel/updateActive', false)
                                }
                            }
                        ]
                    })
                    this.$store.commit('panel/updatePanelComponent', 'SpotifyIntegration')
                    this.$store.commit('panel/updateActive', true)
            }
        }
    }
}
</script>

<style scoped>
.top-button {
    display: flex;
    align-items: center;
    cursor: pointer;
    -webkit-app-region: no-drag;
}

.top-button:not(:first-child) {
    margin-left: 20px;
}

.top-button:hover {
    opacity: 0.5;
}

.top-button i {
    font-size: 17px;
}

.top-button span {
    margin-left: 10px;
    font-size: 13px;
}
</style>