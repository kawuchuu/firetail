<template>
    <div class="item-sidebar playlist-sidename">
        <div class="active-indicator"></div>
        <span>{{ playlist.name }}</span>
    </div>
</template>

<script>
export default {
    props: ['playlist']
}
</script>