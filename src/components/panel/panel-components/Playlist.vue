<template>
    <div class="pl-root">
        <div class="pl-info-wrapper">
            <div class="pl-img-wrapper">
                <div class="pl-img" />
            </div>
            <div class="pl-info">
                <div class="input">
                    <label class="input-label">Name</label>
                    <input type="text" v-model="name" placeholder="My Playlist" value="My Playlist" @focus="focused" @blur="unfocused">
                </div>
                <div class="input">
                    <label class="input-label">Description</label>
                    <textarea v-model="desc" placeholder="My playlist description..." @focus="focused" @blur="unfocused"></textarea>
                </div>
            </div>
            <div class="buttons">
                <Button @click.native="close" :button="{ label: 'Cancel' }" />
                <Button @click.native="create" :button="{ label: 'Create' }" />
            </div>
        </div>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import Button from '../../Button.vue'

export default {
    components: {
        Button
    },
    methods: {
        close() {
            this.$store.commit('panel/updateActive', false)
        },
        async create() {
            console.log(this.name, this.desc)
            const playlists = await ipcRenderer.invoke('createPlaylist', {
                name: this.name,
                desc: this.desc
            })
            this.$store.commit('playlist/setPlaylists', playlists)
            this.close()
        },
        focused() {
            this.$store.commit('audio/setPauseSpace', true)
        },
        unfocused() {
            this.$store.commit('audio/setPauseSpace', false)
        }
    },
    data() {
        return {
            name: 'My Playlist',
            desc: ''
        }
    }
}
</script>

<style lang="scss" scoped>
.pl-info-wrapper {
    padding: 10px 20px 20px;
    display: grid;
    grid-template-areas: 
    'img info'
    'buttons buttons';
    grid-template-columns: 170px 1fr;
}

.pl-img-wrapper {
    grid-area: img;
    align-self: flex-start;
    margin-top: 25px;
}

.pl-img {
    width: 140px;
    height: 140px;
    background-color: var(--sub-fg);
    background-image: url('../../../assets/no_album.svg');
    border-radius: 5px;
}

.pl-info {
    grid-area: info;
}

.input {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}
.input label {
    font-size: 12px;
    opacity: 0.75;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    margin-left: 15px;
}
.input input, .input textarea {
    background: var(--sub-fg);
    border: none;
    padding: 10px 15px;
    height: 20px;
    color: var(--text);
    font-family: Inter, sans-serif;
    border-radius: 10px;
    outline: none;
}

.input textarea {
    resize: none;
    height: 80px;
}

.input input:focus, .input textarea:focus {
    background: var(--fg-bg)
}

.buttons {
    grid-area: buttons;
    justify-self: end;
    display: flex;
}
</style>