<template>
    <li class="results-link" @mouseover="listHover" @mouseleave="listHoverLeave" :class="isActive">
        <i class="material-icons-outlined play-pause" :style="listIconVisible" @click="decidePlaySong" @mouseover="listIconHover" @mouseleave="listIconHoverLeave">{{ listIcon }}</i>
        <div class="artist-title-album" @dblclick="playSong">
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
        },
        listIcon() {
            if (this.song.id == this.$store.state.audio.currentSong && this.$store.state.audio.paused) {
                return 'play_arrow'
            } else if (this.song.id == this.$store.state.audio.currentSong && this.isIconHover) {
                return 'pause'
            } else if (this.song.id == this.$store.state.audio.currentSong) {
                return 'volume_up'
            } else {
                return 'play_arrow'
            }
        },
        listIconVisible() {
            if (this.song.id == this.$store.state.audio.currentSong || this.isHover) {
                return 'opacity: 1'
            } else {
                return 'opacity: 0'
            }
        }
    },
    data() {
        return {
            isHover: false,
            isIconHover: false
        }
    },
    methods: {
        playSong() {
            this.$store.commit('audio/genNewQueue', this.$store.state.audio.currentList)
            this.$store.dispatch('audio/playSong', this.song)
        },
        decidePlaySong() {
            if (this.song.id == this.$store.state.audio.currentSong) {
                this.$store.dispatch('audio/playPause')
            } else {
                this.playSong()
            }
        },
        listHover() {
            this.isHover = true
        },
        listHoverLeave() {
            this.isHover = false
            this.isIconHover = false
        },
        listIconHover() {
            if (this.song.id == this.$store.state.audio.currentSong) {
                this.isIconHover = true
            }
        },
        listIconHoverLeave() {
            this.isIconHover = false
        }
    }
}
</script>