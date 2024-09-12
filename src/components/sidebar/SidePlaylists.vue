<template>
    <router-link :to="link">
        <div draggable="true" :class="isDragOverClass" @pointerdown="context" @dragover="handleDragOver" @dragleave="handleDragLeave" @dragend="handleDragLeave" @drop="handleDrop" class="item-sidebar playlist-sidename">
            <div v-if="playlist.hasImage === 1" class="playlist-image" :style="playlistImage" />
            <div v-else class="playlist-image" />
            <span>{{ playlist.name }}</span>
        </div>
    </router-link>
</template>

<script>
import { contextMenuBus } from '../../renderer.js'

export default {
    props: ['playlist'],
    data() {
        return {
            port: this.$store.state.nav.port,
            isDragOver: false,
            link: `/playlist?id=${this.playlist.id}&view=playlist_${this.playlist.id}`
        }
    },
    computed: {
        isDragOverClass() {
            if (this.isDragOver) return 'drag-over'
            else return ''
        },
        playlistImage() {
            return `background-image: url('http://localhost:${this.port}/images/playlist/${this.playlist.id}.jpg?${window.performance.now()}')`
        }
    },
    methods: {
        context(evt) {
            // everything below is temporary, will develop a proper context menu system :)
            if (evt.which !== 3) return
            let menuItems = [
                {label: this.$t('CONTEXT_MENU.PLAYLIST_SIDE_ITEM.EDIT_PLAYLIST'), type: 'normal', onClick: this.openEditDialog},
                /*{label: this.$t('CONTEXT_MENU.PLAYLIST_SIDE_ITEM.RENAME'), type: 'normal', onClick: this.openEditDialog},*/
                {type: 'separator'},
                {label: this.$t('CONTEXT_MENU.PLAYLIST_SIDE_ITEM.REMOVE_PLAYLIST'), type: 'normal', style: 'dangerous', onClick: this.delete}
            ]
            contextMenuBus.$emit('updateitems', {
                items: menuItems,
                position: {
                    clientX: evt.clientX,
                    clientY: evt.clientY
                }
            })
        },
        async delete() {
            const newPlaylists = await window.ipcRenderer.invoke('deletePlaylist', this.playlist.id)
            this.$store.commit('playlist/setPlaylists', newPlaylists)
        },
        async openEditDialog() {
            const fullPlaylist = await window.ipcRenderer.invoke('getSpecificPlaylist', this.playlist.id)
            this.$store.commit('panel/invokeNewPanel', {
                component: 'PlaylistModule.vue',
                newProps: {
                    topMsg: this.$t('PANEL.PLAYLIST.EDIT_TITLE'),
                    playlist: fullPlaylist[0]
                }
            })
        },
        handleDragOver(evt) {
            evt.preventDefault()
            if (evt.dataTransfer && evt.dataTransfer.types.indexOf('ftsong') !== -1) {
                evt.dataTransfer.dropEffect = 'copy'
                this.isDragOver = true
            } else if (evt.dataTransfer) {
                evt.dataTransfer.dropEffect = 'none'
            }
        },
        handleDragLeave() {
            this.isDragOver = false
        },
        async handleDrop(evt) {
            evt.preventDefault()
            this.isDragOver = false
            let songs = evt.dataTransfer.getData('ftsong')
            if (songs === '') return
            songs = JSON.parse(songs)
            const playlist = await window.ipcRenderer.invoke('getSpecificPlaylist', this.playlist.id)
            const songIds = JSON.parse(playlist[0].songIds)
            const currentLength = songIds.length
            songs.forEach((song, index) => {
                songIds.push({
                    id: song.id,
                    position: currentLength + index
                })
            })
            await window.ipcRenderer.invoke('updatePlaylist', {
                column: 'songids',
                id: this.playlist.id,
                data: JSON.stringify(songIds)
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.playlist-sidename {
    height: 38px;
    box-sizing: border-box;
}

.playlist-sidename .active-indicator {
    height: 20px;
}

.playlist-sidename span {
    font-size: 14px;
    //margin-left: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
}

.playlist-sidename.active span {
    //margin-left: 13px
}

.playlist-sidename.drag-over {
    outline: dashed var(--hl-txt) 2px;
    opacity: 1;
}

.router-link-active .item-sidebar {
    opacity: 0.75;
    cursor: pointer;
    background: none;
}

.router-link-active:hover {
    opacity: 1;
}

.router-link-active .item-sidebar:active {
    opacity: 0.75;
}

.router-link-active .item-sidebar span {
    font-weight: normal;
}

.router-link-exact-active .item-sidebar {
    opacity: 1;
    cursor: default;
    background: var(--fg-bg);
}

.router-link-exact-active .item-sidebar:hover {
    opacity: 1;
}

.router-link-exact-active .item-sidebar:active {
    opacity: 1;
}

.router-link-exact-active .item-sidebar span {
    font-weight: 600;
}

.playlist-image {
    min-width: 25px;
    min-height: 25px;
    background-image: url('../../assets/no_album.svg');
    background-size: cover;
    background-color: var(--bg);
    margin: 0 12px;
    border-radius: 4px;
}
</style>