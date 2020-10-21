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
            let view = this.$route.query.view
            if (this.song.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView) {
                return "active"
            } else {
                return ""
            }
        },
        listIcon() {
            let view = this.$route.query.view
            if (this.song.id == this.$store.state.audio.currentSong && this.$store.state.audio.paused && view == this.$store.state.nav.playingView) {
                return 'play_arrow'
            } else if (this.song.id == this.$store.state.audio.currentSong && this.isIconHover && view == this.$store.state.nav.playingView) {
                return 'pause'
            } else if (this.song.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView) {
                return 'volume_up'
            } else {
                return 'play_arrow'
            }
        },
        listIconVisible() {
            let view = this.$route.query.view
            if (this.song.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView || this.isHover) {
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
            let currentList = []
            this.$store.state.audio.currentList.forEach(f => { currentList.push(f) })
            this.$store.commit('audio/genNewQueue', currentList)
            this.$store.dispatch('audio/playSong', this.song)
        },
        decidePlaySong() {
            let view = this.$route.query.view
            if (this.song.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView) {
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