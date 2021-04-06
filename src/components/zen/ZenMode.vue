<template>
    <div @mousemove="updateMouseMove" :style="hideCursor" class="zen">
        <div class="info-wrapper">
            <div class="album-art" :style="getImage"></div>
            <div class="song-info">
                <h1>{{title}}</h1>
                <p>{{artist}}</p>
            </div>
        </div>
    </div>
</template>

<script>
import * as Vibrant from 'node-vibrant'
import { mapState } from 'vuex'

export default {
    methods: {
        showUI() {
            if (!this.isUIShown) {
                this.$store.commit('nav/updateZenMouse', true)
                this.isUIShown = true
            }
        },
        updateMouseMove() {
            this.showUI()
            clearTimeout(this.mouseTimeout)
            this.mouseTimeout = setTimeout(this.hideUI, 3000)
        },
        hideUI() {
            this.isUIShown = false
            this.$store.commit('nav/updateZenMouse', false)
        },
    },
    asyncComputed: {
        getImage() {
            let song = this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex]
            if (song) {
                let port = this.$store.state.nav.port
                if (song.hasImage == 1) {
                    let artistAlbum = ''
                    if (song.id == 'customSong') {
                        artistAlbum = song.customImage
                    } else {
                        artistAlbum = `http://localhost:${port}/${(song.artist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
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
    },
    computed: {
        ...mapState('audio', {
            title: state => state.songTitle,
            artist: state => state.songArtist,
        }),
        hideCursor() {
            if (!this.isUIShown) {
                return 'cursor: none'
            } else {
                return ''
            }
        }
    },
    data() {
        return {
            mouseTimeout: setTimeout(this.hideUI, 3000),
            isUIShown: true
        }
    },
    mounted() {
        this.isUIShown = true
        clearTimeout(this.mouseTimeout)
        this.mouseTimeout = setTimeout(this.hideUI, 3000)
    },
    beforeDestroy() {
        this.isUIShown = false
        clearTimeout(this.mouseTimeout)
    }
}
</script>

<style lang="scss" scoped>
    .zen {
        width: 100vw;
        height: 100vh;
        position: fixed;
        z-index: 11;
        background: black;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .album-art {
        width: 400px;
        height: 400px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        background-image: url('../../assets/no_image.svg');
        border-radius: 10px;
        transition: 0.25s;
    }

    .song-info {
        padding: 50px;
        text-align: center;

        h1 {
            font-size: 46px;
            letter-spacing: -2px;
            margin: 0 0 20px;
        }

        p {
            margin: 20px 0 0;
        }
    }

    .info-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        pointer-events: none;
    }
</style>