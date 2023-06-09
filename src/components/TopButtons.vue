<template>
    <label @click="click" class="std-top-btn top-button" :for="checkFor">
        <i class="ft-icon">{{button.icon}}</i>
        <!-- <span>{{button.name}}</span> -->
    </label>
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
                case "settings":
                    this.$router.push('/settings') 
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

<style scoped lang="scss">
.top-button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-app-region: no-drag;
    margin-right: 20px;
}

.top-button:last-child {
    margin-right: 0px;
}

.rtl {
    .top-button {
        margin-right: 0px;
        margin-left: 20px;
    }

    .top-button:last-child {
        margin-left: 0px;
    }
}

/* .top-button:not(:first-child) {
    margin-left: 20px;
} */

.top-button:hover {
    opacity: 0.5;
}

.top-button i {
    font-size: 22px;
}
</style>