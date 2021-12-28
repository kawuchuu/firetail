<template>
    <div class="pl-root">
        <div class="pl-info-wrapper">
            <div class="pl-img-wrapper">
                <label for="playlistImg">
                    <div class="pl-img" :style="displayImage">
                        <div class="label-wrapper">
                            <span>Choose image</span>
                        </div>
                    </div>
                </label>
                <input style="display: none" type="file" id="playlistImg" accept="image/*" @change="updateImage">
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
                <Button @click.native="createOrEdit" :button="{ label: saveBtn }" />
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
        async createOrEdit() {
            console.log(this.name, this.desc)
            let playlists
            let buffer
            if (this.imageBlob) {
                buffer = await new Promise(resolve => {
                    const reader = new FileReader()
                    reader.addEventListener('loadend', () => {
                        resolve(reader.result)
                    })
                    reader.readAsArrayBuffer(this.imageBlob)
                })
            }
            if (this.$attrs.props.playlist && this.$attrs.props.playlist.name) {
                const playlist = this.$attrs.props.playlist
                if (this.desc) {
                    await ipcRenderer.invoke('updatePlaylist', {
                        column: 'desc',
                        id: playlist.id,
                        data: this.desc,
                    })
                }
                if (this.image) {
                    ipcRenderer.invoke('createPlaylistImage', {
                        buffer: buffer,
                        id: playlist.id
                    })
                }
                playlists = await ipcRenderer.invoke('updatePlaylist', {
                    column: 'name',
                    id: playlist.id,
                    data: this.name,
                })
            } else {
                playlists = await ipcRenderer.invoke('createPlaylist', {
                    name: this.name,
                    desc: this.desc,
                    buffer: buffer
                })
            }
            this.$store.commit('playlist/setPlaylists', playlists)
            this.close()
        },
        focused() {
            this.$store.commit('audio/setPauseSpace', true)
        },
        unfocused() {
            this.$store.commit('audio/setPauseSpace', false)
        },
        async updateImage(evt) {
            if (evt.target.files[0].type.startsWith('image')) {
                this.image = URL.createObjectURL(evt.target.files[0])
                this.imageBlob = evt.target.files[0]
            }
        }
    },
    computed: {
        displayImage() {
            if (this.image) {
                return `background-image: url('${this.image}')`
            } else return ''
        }
    },
    data() {
        return {
            name: 'My Playlist',
            desc: '',
            saveBtn: 'Create',
            image: null,
            imageBlob: null
        }
    },
    mounted() {
        const playlist = this.$attrs.props.playlist
        if (playlist) {
            if (playlist.name || playlist.desc) this.saveBtn = 'Save'
            if (playlist.name) this.name = playlist.name
            if (playlist.desc) this.desc = playlist.desc
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
    background-size: cover;
    border-radius: 5px;
    overflow: hidden;

    .label-wrapper {
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: center;
        background: #000000a2;

        span {

        }
    }
}

.pl-img:hover {
    .label-wrapper {
        opacity: 1;
    }
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