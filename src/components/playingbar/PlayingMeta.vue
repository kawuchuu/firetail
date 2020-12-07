<template>
    <div class="song-info">
        <div class="colour-bg" :style="getColour"></div>
        <div class="song-album-art" :style="getImage"></div>
        <div class="title-artist">
            <div class="song-title-fav">
                <div class="song-title">{{title}}</div>
                <i class="material-icons-outlined favourite-icon" :class="isFavourite" @click="handleFavourite">{{ favouriteIcon }}</i>
            </div>
            <div class="song-artist">{{artist}}</div>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import {ipcRenderer} from 'electron'
import * as Vibrant from 'node-vibrant'

export default {
    computed: {
        ...mapState('audio', {
            title: state => state.songTitle,
            artist: state => state.songArtist
        }),
        getImage() {
            let song = this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex]
            if (song) {
                let port = this.$store.state.nav.port
                if (song.hasImage == 1) {
                    let artistAlbum = `${song.artist}${song.album}`.replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')
                    Vibrant.from(`http://localhost:${port}/${artistAlbum}.jpg`).getPalette((err, palette) => {
                        this.$store.commit('nav/updatePlayingBarColour', palette.Vibrant.hex)
                    })
                    return `background-image: url('http://localhost:${port}/${artistAlbum}.jpg')`
                } else {
                    this.$store.commit('nav/updatePlayingBarColour', null)
                    return ''
                }
            } else {
                this.$store.commit('nav/updatePlayingBarColour', null)
                return ''
            }
        },
        getColour() {
            let colour = this.$store.state.nav.playingBarColour
            if (colour == null) return ''
            return `background-color: ${colour}`
        },
        favouriteIcon() {
            if (this.$store.state.nav.favouriteSongs.indexOf(this.$store.state.audio.currentSong) != -1) {
                return 'favorite'
            } else {
                return 'favorite_border'
            }
        },
        isFavourite() {
            if (this.$store.state.nav.favouriteSongs.indexOf(this.$store.state.audio.currentSong) != -1) {
                console.log('what')
                return 'active'
            } else {
                return ''
            }
        }
    },
    methods: {
        handleFavourite() {
            if (this.$store.state.nav.favouriteSongs.indexOf(this.$store.state.audio.currentSong) == -1) {
                this.addToFavourite()
            } else {
                this.removeFromFavourites()
            }
        },
        addToFavourite() {
            ipcRenderer.send('addFavourite', this.$store.state.audio.currentSong)
            console.log('yeah')
        },
        removeFromFavourites() {
            ipcRenderer.send('removeFavourite', this.$store.state.audio.currentSong)
        }
    }
}
</script>

<style scoped>
.song-info {
    display: flex;
    align-items: center;
    height: 100%;
    width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0px 15px;
}

.title-artist {
    overflow: hidden;
}

.song-album-art {
    min-width: 55px;
    min-height: 55px;
    margin-right: 15px;
    left: 0;
    border-radius: 3px;
    z-index: 2;
    background-image: url('../../assets/no_image.svg');
    background-color: var(--bg);
    background-position: center !important;
    background-size: cover !important;
    transition: .1s;
}

.song-title {
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    line-height: 20px;
    white-space: nowrap;
    max-width: 350px;
    font-weight: bold;
    margin-right: 10px;
}

.song-artist {
    margin: 0;
    opacity: .75;
    font-size: 12px;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 15px;
}

.favourite-icon {
    font-size: 18px;
    opacity: 0.5;
}

.favourite-icon.active {
    opacity: 1;
    color: var(--hl-txt)
}

.song-title-fav {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}

.colour-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
    transform: translateX(-15px);
    opacity: 0.1;
    transition: .1s;
}
</style>