<template>
    <div class="song-info">
        <div class="colour-bg" :style="getColour"></div>
        <div class="large-album-art" :class="hoverShow" >
            <div class="inner" :style="getImage"></div>
        </div>
        <router-link :to="viewLink">
            <div class="song-album-art" :style="getImage" @mouseover="hoverImage" @mouseleave="leaveImage"></div>
        </router-link>
        <div class="title-artist">
            <div class="song-title">{{title}}</div>
            <div class="song-artist">{{artist}}</div>
        </div>
        <i class="ft-icon favourite-icon" :class="[isFavourite, isInLibrary]" @click="handleFavourite">{{ favouriteIcon }}</i>
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
            artist: state => state.songArtist,
            isInLibrary: state => {
                if (state.queue.length == 0 || state.queue[state.currentSongIndex].id == 'customSong') {
                    return 'hide'
                } else {
                    ''
                }
            }
        }),
        getImage() {
            let song = this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex]
            if (song) {
                let port = this.$store.state.nav.port
                if (song.hasImage == 1) {
                    let artistAlbum = ''
                    if (song.id == 'customSong') {
                        artistAlbum = song.customImage
                    } else {
                        artistAlbum = `http://localhost:${port}/images/${(song.artist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
                    }
                    Vibrant.from(artistAlbum).getPalette((err, palette) => {
                        this.$store.commit('nav/updatePlayingBarColour', palette.Vibrant.hex)
                    })
                    return `background-image: url('${artistAlbum}')`
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
                return 'heart-filled'
            } else {
                return 'heart'
            }
        },
        isFavourite() {
            if (this.$store.state.nav.favouriteSongs.indexOf(this.$store.state.audio.currentSong) != -1) {
                return 'active'
            } else {
                return ''
            }
        },
        hoverShow() {
            let song = this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex]
            if (!song) return ''
            if (song.hasImage == 0) return ''
            if (this.showLargeImage) {
                return 'hover'
            } else {
                return ''
            }
        },
        viewLink() {
            const playingView = this.$store.state.nav.playingView
            if (!playingView) return '/?view=all'
            const splitView = playingView.split('_')
            switch(splitView[0]) {
                case 'playlist': {
                    return `/playlist?id=${splitView[1]}&view=${playingView}`
                }
                case 'artist': {
                    return `/artists?hideTop=true&column=artist&q=${playingView.substr(7)}&view=${playingView}`
                }
                case 'album': {
                    return `/albums?hideTop=true&column=album&q=${playingView.substr(6)}&view=${playingView}`
                }
                default: {
                    return '/?view=all'
                }
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
        },
        removeFromFavourites() {
            ipcRenderer.send('removeFavourite', this.$store.state.audio.currentSong)
        },
        hoverImage() {
            this.showLargeImage = true
        },
        leaveImage() {
            this.showLargeImage = false
        }
    },
    data() {
        return {
            showLargeImage: false
        }
    }
}
</script>

<style lang="scss" scoped>
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
    border-radius: 2px;
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
    margin-bottom: 3px;
    letter-spacing: -0.01em;
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
    margin-left: 12px;
    cursor: pointer;
}

.favourite-icon:hover {
    opacity: 0.8;
}

.favourite-icon:active {
    opacity: 0.3;
}

.favourite-icon.active {
    opacity: 1;
    color: var(--hl-txt)
}

.favourite-icon.active:hover {
    opacity: 0.7;
}

.favourite-icon.active:active {
    opacity: 0.5;
}

.favourite-icon.hide {
    display: none;
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

.large-album-art {
    position: fixed;
    width: 300px;
    height: 300px;
    background: #000;
    transform: translateY(-215px);
    border-radius: 5px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    pointer-events: none;
    opacity: 0;
    //transition: .15s;
    border: solid 1px var(--bd);

    .inner {
        width: 100%;
        height: 100%;
        border-radius: 5px;
        background-color: #000;
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        z-index: 2;
        position: relative;
        transition: .15s;
    }
}

.large-album-art::after {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: #000;
    position: absolute;
    bottom: -8px;
    left: 18px;
    border: solid 1px var(--bd);
    border-radius: 2px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    z-index: 1;
}

.large-album-art.hover {
    opacity: 1;
}
</style>