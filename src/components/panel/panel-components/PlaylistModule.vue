<template>
    <div class="pl-root">
        <div class="pl-info-wrapper">
            <div class="pl-img-wrapper">
                <div class="pl-img" :style="displayImage">
                    <label for="playlistImg">
                        <div class="label-wrapper">
                            <span>{{ $t('PANEL.PLAYLIST.CHOOSE_IMAGE') }}</span>
                        </div>
                    </label>
                </div>
                <input style="display: none" type="file" id="playlistImg" accept="image/*" @change="updateImage">
                <span class="remove-image">{{ $t('PANEL.PLAYLIST.REMOVE_IMAGE') }}</span>
            </div>
            <div class="pl-info">
                <div class="input">
                    <label class="input-label">{{ $t('PANEL.PLAYLIST.NAME_INPUT') }}</label>
                    <input type="text" v-model="name" :placeholder="$t('PANEL.PLAYLIST.DEFAULT_NAME')" @focus="focused" @blur="unfocused">
                </div>
                <div class="input">
                    <label class="input-label">{{$t('PANEL.PLAYLIST.DESC_INPUT')}}</label>
                    <textarea v-model="desc" :placeholder="$t('PANEL.PLAYLIST.DEFAULT_DESC')" @focus="focused" @blur="unfocused"></textarea>
                </div>
            </div>
            <div class="buttons">
                <StandardButton @click.native="close" :button="{ label: $t('BUTTONS.CANCEL') }" />
                <StandardButton @click.native="createOrEdit" :button="{ label: saveBtn, style: 'primary' }" />
            </div>
        </div>
    </div>
</template>

<script>
import StandardButton from '../../StandardButton.vue'

export default {
    components: {
        StandardButton
    },
    methods: {
        close() {
            this.$store.commit('panel/updateActive', false)
        },
        async createOrEdit() {
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
                    await window.ipcRenderer.invoke('updatePlaylist', {
                        column: 'desc',
                        id: playlist.id,
                        data: this.desc,
                    })
                }
                if (this.image) {
                    await window.ipcRenderer.invoke('updatePlaylist', {
                        column: 'hasImage',
                        id: playlist.id,
                        data: 1,
                    })
                    window.ipcRenderer.invoke('createPlaylistImage', {
                        buffer: buffer,
                        id: playlist.id
                    })
                } else {
                    await window.ipcRenderer.invoke('updatePlaylist', {
                        column: 'hasImage',
                        id: playlist.id,
                        data: 1,
                    })
                }
                playlists = await window.ipcRenderer.invoke('updatePlaylist', {
                    column: 'name',
                    id: playlist.id,
                    data: this.name,
                })
            } else {
                playlists = await window.ipcRenderer.invoke('createPlaylist', {
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
            name: this.$t('PANEL.PLAYLIST.DEFAULT_NAME'),
            desc: '',
            saveBtn: this.$t('BUTTONS.CREATE'),
            image: null,
            imageBlob: null
        }
    },
    mounted() {
        const playlist = this.$attrs.props.playlist
        const port = this.$store.state.nav.port
        if (playlist) {
            if (playlist.name || playlist.desc) this.saveBtn = this.$t('BUTTONS.SAVE')
            if (playlist.name) this.name = playlist.name
            if (playlist.desc) this.desc = playlist.desc
            if (playlist.hasImage) this.image = `http://localhost:${port}/images/playlist/${playlist.id}.jpg?${performance.now()}`
        }
    }
}
</script>

<style lang="scss" scoped>
.pl-info-wrapper {
    padding: 5px 20px 20px;
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
    display: grid;
    width: 140px;

    span.remove-image {
        font-size: 0.8em;
        justify-self: center;
        margin-top: 10px;
        opacity: 0.5;
        cursor: pointer;
    }

    span.remove-image:hover {
        opacity: 1;
    }

    span.remove-image:active {
        opacity: 0.65;
    }
}

.pl-img {
    width: 140px;
    height: 140px;
    background-color: var(--sub-fg);
    background-image: url('../../../assets/no_album.svg');
    background-size: cover;
    background-position: center;
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
    }
}

:root.light .label-wrapper {
    background: #ffffff7a;
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
    font-size: 0.9em;
    opacity: 0.75;
    //text-transform: uppercase;
    //letter-spacing: 1px;
    margin-bottom: 8px;
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