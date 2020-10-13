<template>
    <div class="artists">
        <section class="artists-list">
            <div class="artist-inner">
                <ArtistItems v-for="item in artistItems" :artist="item" :key="item.id"/>
            </div>
        </section>
        <section class="song-list">
            <router-view></router-view>
        </section>
    </div>
</template>

<script>
import ArtistItems from './ArtistItems'

export default {
    components: {
        ArtistItems
    },
    computed: {
        artistItems() {
            console.log(this)
            return this.$store.state.nav.artists
        }
    },
    mounted() {
        this.$store.dispatch('nav/requestColumn', 'artist')
    }
}
</script>

<style scoped>
.artist-inner {
    position: fixed;
    border-right: solid 2px var(--bd);
    overflow: hidden;
    overflow-y: auto;
    width: 250px;
    height: calc(100% - 139px);
    z-index: 2;
}
.artists {
    display: flex;
    width: 100%;
    height: 100%;
}

.artists-list {
    width: 250px;
    height: 100%;
}

.artist-inner::-webkit-scrollbar {
    display: none;
}

.song-list {
    width: calc(100% - 250px);
    height: 100%;
}
</style>