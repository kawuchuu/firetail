<template>
    <div class="artists-item">
        <router-link :to="`?hideTop=true&column=artist&q=${encodeURIComponent(artist.artist)}&view=artist_${encodeURIComponent(artist.artist)}`">
            <div class="artist-img"/>
            <span>{{ artist.artist }}</span>
        </router-link>
    </div>
</template>

<script>
export default {
    props: ['artist']
}
</script>

<style scoped>
.artists-item {
    height: 60px;
    border-bottom: solid 1px var(--bd);
}

.router-link-exact-active {
    background-color: var(--li-hv);
    cursor: default;
}

.artists-item a {
    display: flex;
    align-items: center;
    height: 100%;
}

.artists-item:hover {
    background-color: var(--li-hv)
}

.artists-item a span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.artist-img {
    min-width: 45px;
    min-height: 45px;
    margin: 0px 15px;
    background-color: var(--fg-bg);
    border-radius: 60px;
}
</style>