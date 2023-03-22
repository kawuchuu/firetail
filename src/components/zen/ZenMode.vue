<template>
    <div @mousemove="updateMouseMove" :style="hideCursor" class="zen">
        <div class="info-wrapper">
            <div class="album-art" :style="getImage"></div>
            <div class="song-info">
                <h1>{{title}}</h1>
                <p>{{artist}}</p>
            </div>
        </div>
        <div class="bg-cover" />
        <div class="bg" :style="getImage" />
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
            this.mouseTimeout = setTimeout(this.hideUI, 2000)
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
            mouseTimeout: setTimeout(this.hideUI, 2000),
            isUIShown: true
        }
    },
    mounted() {
        this.isUIShown = true
        clearTimeout(this.mouseTimeout)
        this.mouseTimeout = setTimeout(this.hideUI, 2000)
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
    align-items: flex-end;
    //justify-content: center;
}

.album-art {
    min-width: 275px;
    min-height: 275px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('../../assets/no_image.svg');
    border-radius: 10px;
    transition: 0.25s;
}

.song-info {
    padding: 50px 0px 20px 50px;
    //text-align: center;

    h1 {
        font-size: 4.5em;
        letter-spacing: -0.03em;
        margin: 0 0 20px;
        font-weight: 600;
    }

    p {
        margin: 20px 0 0;
        font-size: 1.5em;
        opacity: 0.8;
    }
}

.info-wrapper {
    display: flex;
    align-items: flex-end;
    width: 100%;
    pointer-events: none;
    margin-left: 100px;
    margin-bottom: 200px;
    z-index: 3;
}

.bg {
    width: 100%;
    height: 100%;
    transform: scale(1.1);
    position: fixed;
    z-index: 1;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    filter: blur(10px);
    opacity: 0.65;
    transition: 0.8s;
}

.bg-cover {
    width: 100%;
    height: 100%;
    position: fixed;
    background: radial-gradient(farthest-corner at 5% 10%, transparent 5%, #000000e1);
    z-index: 2;
}
</style>