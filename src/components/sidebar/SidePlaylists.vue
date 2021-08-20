<template>
    <div draggable="true" @pointerdown="context" class="item-sidebar playlist-sidename">
        <span>{{ playlist.name }}</span>

    </div>
</template>

<script>
import { bus } from '@/main'

export default {
    props: ['playlist'],
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
        }
    }
}
</script>