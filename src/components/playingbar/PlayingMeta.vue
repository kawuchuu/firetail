<template>
    <div class="song-info">
        <div class="popup large-album-art" :class="hoverShow" >
            <div class="inner" :style="getImageBg"></div>
        </div>
        <div v-if="currentSong" class="popup codec-info" :class="[showMoreInfo, showAdvancedFileInfo]">
            <div class="info">
                <h3>{{ $t('POPUPS.CODEC_INFO.TITLE') }}</h3>
                <p>{{ $t('POPUPS.CODEC_INFO.ALBUM') }}{{ currentSong.album ? currentSong.album : 'Unknown' }}</p>
                <p>{{ $t('POPUPS.CODEC_INFO.YEAR') }}{{ currentSong.year ? currentSong.year : 'Unknown' }}</p>
                <p>{{ $t('POPUPS.CODEC_INFO.TRACK_NUMBER') }}{{ currentSong.trackNum ? currentSong.trackNum : 'Unknown' }}</p>
                <p>{{ $t('POPUPS.CODEC_INFO.DISC') }}{{ currentSong.disc ? currentSong.disc : 'Unknown' }}</p>
                <p v-if="advancedFileInfo.bitrate">{{ $t('POPUPS.CODEC_INFO.BITRATE') }}{{ Math.round(advancedFileInfo.bitrate / 1000) }}kb/s</p>
                <div class="advanced">
                    <p v-if="advancedFileInfo.bitDepth">{{ $t('POPUPS.CODEC_INFO.BIT_DEPTH') }}{{ advancedFileInfo.bitDepth }}-bit</p>
                    <p v-if="advancedFileInfo.sampleRate">{{ $t('POPUPS.CODEC_INFO.SAMPLE_RATE') }}{{ advancedFileInfo.sampleRate }}Hz</p>
                    <p v-if="advancedFileInfo.codec">{{ $t('POPUPS.CODEC_INFO.CODEC') }}{{ advancedFileInfo.codec }}</p>
                    <p v-if="advancedFileInfo.container">{{ $t('POPUPS.CODEC_INFO.CONTAINER') }}{{ advancedFileInfo.container }}</p>
                </div>
            </div>
        </div>
        <router-link :to="viewLink">
            <div class="song-album-art" :style="getImageBg" @mouseover="hoverImage" @mouseleave="leaveImage"></div>
        </router-link>
        <div v-if="currentSong" ref="titleArtist" class="title-artist" @mouseover="hoverCodec" @mouseleave="leaveCodec">
            <router-link ref="songTitle" :style="songTitleStyle" :to="`/albums?hideTop=true&column=album&q=${encodeURIComponent(currentSong.album)}&view=album_${encodeURIComponent(currentSong.albumArtist + currentSong.album)}&albumArtist=${encodeURIComponent(currentSong.albumArtist)}`" class="song-title">{{title}}<div v-if="currentSong.explicit" class="explicit"><span>E</span></div></router-link>
            <router-link :to="`/artists?hideTop=true&column=artist&q=${encodeURIComponent(artist)}&view=artist_${encodeURIComponent(artist)}`" class="song-artist">{{artist}}</router-link>
        </div>
        <div v-else ref="titleArtist" class="title-artist" @mouseover="hoverCodec" @mouseleave="leaveCodec">
            <span ref="songTitle" class="song-title">{{title}}<div v-if="currentSong && currentSong.explicit" class="explicit"><span>E</span></div></span>
            <span class="song-artist">{{artist}}</span>
        </div>
        <i class="ft-icon favourite-icon" :class="[isFavourite, isInLibrary]" @click="handleFavourite">{{ favouriteIcon }}</i>
        <img :src="getImage()" :ref="'albumArt'" class="hidden-img" crossorigin="anonymous" />
    </div>
</template>

<script>
import {mapState} from 'vuex'
import * as Vibrant from 'node-vibrant'
import ColorThief from 'colorthief/dist/color-thief.mjs'

export default {
    computed: {
        ...mapState('audio', {
            title: state => state.songTitle,
            artist: state => state.songArtist,
            currentSong: state => state.queue[state.currentSongIndex],
            isInLibrary: state => {
                if (state.queue.length == 0 || state.queue[state.currentSongIndex].id == 'customSong') {
                    return 'hide'
                } else {
                    ''
                }
            }
        }),
        getImageBg() {
            const image = this.getImage()
            if (image && image !== '') return `background-image: url('${image}')`
            else return ''
        },
        getColour() {
            let colour = this.$store.state.nav.playingBarColour
            if (colour == null) return ''
            return `background: radial-gradient(farthest-corner at bottom left, var(--fg-bg), transparent 60%), radial-gradient(farthest-corner at bottom left, ${colour}, transparent 60%)`
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
            console
            if (song.hasImage == 0 && this.showLargeImage && this.$store.state.nav.advancedFileInfo) {
                return 'hover-noimg'
            } else if (this.showLargeImage && song.hasImage == 1) {
                return 'hover'
            } else {
                return ''
            }
        },
        viewLink() {
            const playingView = encodeURIComponent(this.$store.state.nav.playingView)
            if (!playingView) return '/songs?view=all'
            const splitView = playingView.split('_')
            switch(splitView[0]) {
                case 'playlist': {
                    return `/playlist?id=${encodeURIComponent(splitView[1])}&view=${playingView}`
                }
                case 'artist': {
                    return `/artists?hideTop=true&column=artist&q=${playingView.substr(7)}&view=${playingView}`
                }
                case 'album': {
                    return `/albums?hideTop=true&column=album&q=${playingView.substr(6)}&view=${playingView}&albumArtist=${encodeURIComponent(this.currentSong.albumArtist)}`
                }
                case 'all': {
                    return '/songs?view=all '
                }
                default: {
                    return '/songs?view=all'
                }
            }
        },
        showMoreInfo() {
            return this.showCodecInfo ? 'hover' : ''
        },
        showAdvancedFileInfo() {
            if (this.$store.state.nav.advancedFileInfo) {
                return 'show'
            } else return ''
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
            window.ipcRenderer.send('addFavourite', this.$store.state.audio.currentSong)
        },
        removeFromFavourites() {
            window.ipcRenderer.send('removeFavourite', this.$store.state.audio.currentSong)
        },
        hoverImage() {
            this.showLargeImage = true
        },
        leaveImage() {
            this.showLargeImage = false
        },
        hoverCodec() {
            this.showCodecInfo = true
        },
        leaveCodec() {
            this.showCodecInfo = false
        },
        getImage() {
            let song = this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex]
            if (song) {
                let port = this.$store.state.nav.port
                if (song.hasImage == 1) {
                    let artistAlbum = ''
                    if (song.id == 'customSong') {
                        artistAlbum = song.customImage
                    } else {
                        artistAlbum = `http://localhost:${port}/images/${(song.albumArtist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`
                    }
                    return artistAlbum
                } else {
                    return ''
                }
            } else {
                return ''
            }
        },
        songTitleScroll() {
            const songTitle = this.$refs.songTitle.$el
            const titleArtist = this.$refs.titleArtist
            if (!songTitle || !titleArtist) return ''
            if (songTitle.getBoundingClientRect().width > titleArtist.getBoundingClientRect().width) {
                return `--scrollBy: -${songTitle.getBoundingClientRect().width - titleArtist.getBoundingClientRect().width}px`
            } else return ''
        }
    },
    data() {
        return {
            showLargeImage: false,
            showCodecInfo: false,
            advancedFileInfo: {},
            colorThief: new ColorThief(),
            songTitleStyle: ''
        }
    },
    watch: {
        async title() {
            this.advancedFileInfo = await window.ipcRenderer.invoke('getAdvancedFileInfo', this.$store.state.audio.queue[this.$store.state.audio.currentSongIndex].path)
            this.songTitleStyle = this.songTitleScroll()
        }
    },
    mounted() {
        const albumArt = this.$refs.albumArt
        if (albumArt && albumArt.complete) {
            const promColour = this.colorThief.getColor(albumArt)
            this.$store.commit('nav/updatePlayingBarColour', `rgb(${promColour[0]},${promColour[1]},${promColour[2]})`)
        } else {
            albumArt.addEventListener('load', () => {
                const promColour = this.colorThief.getColor(albumArt)
                this.$store.commit('nav/updatePlayingBarColour', `rgb(${promColour[0]},${promColour[1]},${promColour[2]})`)
            })
            albumArt.addEventListener('error', () => {
              this.$store.commit('nav/updatePlayingBarColour', 'transparent')
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.song-info {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.title-artist {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 15px;
    -webkit-mask-image: -webkit-linear-gradient(180deg, transparent, #000 20px);
}

.song-album-art {
    min-width: 55px;
    min-height: 55px;
    left: 0;
    border-radius: 4px;
    z-index: 2;
    position: relative;
    background-image: url('../../assets/no_image.svg');
    background-color: var(--bg);
    background-position: center !important;
    background-size: cover !important;
    transition: .1s;
}

@keyframes scroll {
    0% {
        transform: translateX(0px);
    }
    25% {
        transform: translateX(0px);
    }
    50% {
        transform: translateX(var(--scrollBy));
    }
    75% {
        transform: translateX(var(--scrollBy));
    }
    100% {
        transform: translateX(0px);
    }
}

.song-title {
    --scrollBy: 0px;
    font-size: 15px;
    overflow: hidden;
    line-height: 20px;
    white-space: nowrap;
    width: fit-content;
    font-weight: 600;
    padding-right: 20px;
    margin-bottom: 3px;
    letter-spacing: -0.01em;
    //animation: scroll 15s infinite linear;
}

.song-title:hover, .song-artist:hover {
    text-decoration: underline;
}

.bold-text .song-title {
    font-weight: bold;
}

.song-artist {
    margin: 0;
    margin-right: 20px;
    opacity: .75;
    font-size: 12px;
    overflow: hidden;
    line-height: 15px;
}

.favourite-icon {
    font-size: 22px;
    opacity: 0.5;
    margin-left: 12px;
    cursor: pointer;
    border-radius: 100px;
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
    height: 500px;
    z-index: -1;
    transform: translateX(-15px);
    opacity: 0.5;
    transition: .8s;
    left: 15px;
    filter: saturate(0.8);
}

.colour-bg.hide {
    display: none;
}

.popup {
    position: fixed;
    width: auto;
    height: 300px;
    background: var(--back-bg);
    border-radius: 10px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    pointer-events: none;
    opacity: 0;
    //transition: .15s;
    border: solid 1px var(--bd);
    transition: 0.2s cubic-bezier(0.17, 0.88, 0.25, 1.1);
    transition-property: transform, opacity;
}

.large-album-art {
    display: flex;
    transform: translate(-190px, -10px) scale(0);
    height: 375px;

    .inner {
        width: 375px;
        height: 375px;
        border-radius: 10px;
        background-color: var(--back-bg);
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
        z-index: 2;
        position: relative;
        transition: .15s;
    }
}

.codec-info {
    width: auto;
    min-width: 200px;
    max-width: 375px;
    height: 200px;
    transform: translate(-10px, -10px) scale(0);
    display: flex;
    align-items: center;

    .info {
        position: relative;
        display: flex;
        flex-direction: column;
        background-color: var(--back-bg);
        height: 170px;
        max-width: 335px;
        padding: 15px 20px;
        z-index: 2;
        border-radius: 10px;

        h3 {
            margin-top: 2px;
            font-weight: 600;
            font-size: 1.1em;
        }

        p {
            font-size: 0.9em;
            margin: 0px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        p:not(:last-child) {
            margin-bottom: 8px;
        }
    }

    .divider {
        width: 1px;
        height: 90%;
        background: var(--bd);
    }

    .advanced {
        display: none;
        //border-left: solid 1px var(--bd);
    }

    
}

.codec-info.show {
    height: 300px;

    .info {
        height: 270px;

        .advanced {
            display: flex;
            flex-direction: column;
        }
    }
}

.codec-info.show.hover {
    transform: translate(70px, -215px) !important;
}

.bold-text .codec-info h3 {
    font-weight: bold;
}

.popup::after {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: var(--back-bg);
    position: absolute;
    bottom: -8px;
    left: 18px;
    border: solid 1px var(--bd);
    border-radius: 2px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    z-index: 1;
}

.popup.hover {
    opacity: 1;
}

.popup.hover.large-album-art {
    transform: translateY(-253px);
}

.popup.hover.codec-info {
    transform: translate(70px, -165px);
}

.explicit {
    width: 14px;
    height: 14px;
    font-size: 0.8em;
    font-weight: 600;
    background: white;
    border-radius: 2px;
    color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 8px;
    opacity: 0.5;
}

.hidden-img {
    opacity: 0.001;
    pointer-events: none;
    position: absolute;
    width: 32px;
    height: 32px;
}

.large-album-art.hover-noimg {
    opacity: 1;

    .inner {
        display: none;
    }
}

.reduce-motion {
    .popup.large-album-art {
        transform: translateY(-215px);
    }

    .popup.codec-info {
        transform: translate(70px, -215px);
    }
}

.rtl {
    .song-title, .song-artist {
        margin-right: 0;
        padding-right: 0;
        padding-left: 20px;
    }

    .title-artist {
        margin-left: 0;
        margin-right: 15px;
        -webkit-mask-image: -webkit-linear-gradient(0deg, transparent, #000 20px);
    }

    .favourite-icon {
        margin-left: 0px;
        margin-right: 12px;
    }
}
</style>