<template>
    <div draggable="true" :class="isDragOverClass" @pointerdown="context" @dragover="handleDragOver" @dragleave="handleDragLeave" @dragend="handleDragLeave" @drop="handleDrop" class="item-sidebar playlist-sidename">
        <span>{{ playlist.name }}</span>

    </div>
</template>

<script>
import { bus } from '@/main'

export default {
    props: ['playlist'],
    data() {
        return {
            isDragOver: false
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
            if (evt.which !== 3) return
            let menuItems = [
                {name: 'Edit playlist', type: 'button'},
                {name: 'Rename', type: 'button'},
                {type: 'divider'},
                {name: 'Remove playlist', type: 'button', style: 'dangerous'}
            ]
            bus.$emit('updateitems', {
                items: menuItems,
                position: {
                    clientX: evt.clientX,
                    clientY: evt.clientY
                }
            })
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
        handleDrop(evt) {
            evt.preventDefault()
            this.isDragOver = false
            const song = evt.dataTransfer.getData('ftsong')
            if (song === '') return
            console.log(JSON.parse(song))
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
</style>