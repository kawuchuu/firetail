<template>
    <li class="results-link" :class="isActive" @dblclick="playSong">
        <i class="material-icons-outlined play-pause" style="opacity: 0;">play_arrow</i>
        <div class="artist-title-album">
            <p class="list-title">{{ song.title }}</p>
            <p class="list-artist"><span>{{song.artist}}</span></p>
            <p class="list-album"><span>{{song.album}}</span></p>
            <p class="list-duration"><span>{{song.duration}}</span></p>
        </div>
    </li>
</template>

<script>
export default {
    props: ['song'],
    computed: {
        isActive() {
            if (this.song.id == this.$store.state.audio.currentSong) {
                return "active"
            } else {
                return ""
            }
        }
    },
    methods: {
        playSong() {
            console.log(this.$store.state.audio.currentList)
            this.$store.dispatch('audio/processQueue')
            this.$store.dispatch('audio/playSong', this.song.id)
        }
    }
}
</script>