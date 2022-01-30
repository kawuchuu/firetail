<template>
    <router-link :to="link">
        <div draggable="true" :class="isDragOverClass" @pointerdown="context" @dragover="handleDragOver" @dragleave="handleDragLeave" @dragend="handleDragLeave" @drop="handleDrop" class="item-sidebar playlist-sidename">
            <span>{{ playlist.name }}</span>
        </div>
    </router-link>
</template>

<script>
import { contextMenuBus } from '@/main'
import { ipcRenderer } from 'electron'

export default {
    props: ['playlist'],
    data() {
        return {
            isDragOver: false,
            link: `/playlist?id=${this.playlist.id}&view=playlist_${this.playlist.id}`
        }
    },
    computed: {
        isDragOverClass() {
            if (this.isDragOver) return 'drag-over'
            else return ''
        }
    },
    methods: {
        context(evt) {
            // everything below is temporary, will develop a proper context menu system :)
            if (evt.which !== 3) return
            let menuItems = [
                {name: 'Edit playlist', type: 'button', onClick: this.openEditDialog},
                {name: 'Rename', type: 'button'},
                {type: 'divider'},
                {name: 'Remove playlist', type: 'button', style: 'dangerous', onClick: this.delete}
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
            const newPlaylists = await ipcRenderer.invoke('deletePlaylist', this.playlist.id)
            console.log(newPlaylists)
            this.$store.commit('playlist/setPlaylists', newPlaylists)
        },
        async openEditDialog() {
            const fullPlaylist = await ipcRenderer.invoke('getSpecificPlaylist', this.playlist.id)
            this.$store.commit('panel/updatePanelProps', {
                topMsg: 'Edit Playlist',
                playlist: fullPlaylist[0]
            })
            this.$store.commit('panel/updatePanelComponent', 'Playlist')
            this.$store.commit('panel/updateActive', true)
        },
        handleDragOver(evt) {
            evt.preventDefault()
            if (evt.dataTransfer && evt.dataTransfer.types[0] === 'ftsong') {
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
            const playlist = await ipcRenderer.invoke('getSpecificPlaylist', this.playlist.id)
            const songIds = JSON.parse(playlist[0].songIds)
            console.log(songs)
            songs.forEach(song => {
                songIds.push(song.id)
            })
            ipcRenderer.invoke('updatePlaylist', {
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
    height: 30px;
    box-sizing: border-box;
}

.playlist-sidename .active-indicator {
    height: 20px;
}

.playlist-sidename span {
    font-size: 14px;
    margin-left: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
}

.playlist-sidename.active span {
    margin-left: 13px
}

.playlist-sidename.drag-over {
    border: dashed var(--hl-txt) 2px;
    opacity: 1;

    span {
        transform: translate(-2px, 1px);
    }
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
    background: #322d47;
}

.router-link-exact-active .item-sidebar:hover {
    opacity: 1;
}

.router-link-exact-active .item-sidebar:active {
    opacity: 1;
}

.router-link-exact-active .item-sidebar span {
    font-weight: bold;
}
</style>