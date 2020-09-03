<template>
    <li class="results-link" @dblclick="playSong">
        <i class="material-icons-outlined play-pause" style="opacity: 0;">play_arrow</i>
        <div class="artist-title-album">
            <p class="list-title">{{ song.title }}</p>
            <p class="list-artist"><span>{{song.artist}}</span></p>
            <p class="list-album"><span>{{song.album}}</span></p>
        </div>
    </li>
</template>

<script>
export default {
    props: ['song'],
    methods: {
        playSong() {
            this.$store.dispatch('playSong', this.song.path)
            this.$store.commit('songMetadata', [this.song.title, this.song.artist])
        }
    }
}
</script>