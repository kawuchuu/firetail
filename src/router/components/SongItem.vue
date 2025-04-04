<template>
    <div class="root" @dragover="songDragOver" @dragleave="songDragLeave" @dragend="songDragLeave" @drop="songDragFinish">
        <div v-if="dragOverY >= 0 && dragOverY <= 21" class="drag-indicate-line top" />
        <li draggable="true" class="results-link" @dragstart="drag" @dragend="stopDrag" @mouseover="listHover" @mouseleave="listHoverLeave" :class="[isActive, doHighlight, isSimple]">
            <i v-if="listIcon !== 'volume-up'" class="ft-icon play-pause" :style="listIconVisible" @click="decidePlaySong" @mouseover="listIconHover" @mouseleave="listIconHoverLeave">{{ listIcon }}</i>
            <div v-if="listIcon == 'volume-up'" class="playing-ani">
                <div class="bar one"></div>
                <div class="bar two"></div>
                <div class="bar three"></div>
            </div>
            <div v-if="$route.path == '/albums'">
                <p v-if="source.disc !== null" class="track-num">{{source.disc}}</p>
                <p v-else class="track-num">-</p>
            </div>
            <div v-if="$route.path == '/albums'">
                <p v-if="source.trackNum !== null" class="track-num">{{source.trackNum}}</p>
                <p v-else class="track-num">-</p>
            </div>
            <div class="artist-title-album" @pointerup="select" @dblclick="playSong">
                <div class="list-title">
                    <div class="title-name">
                        <p>{{ source.title }}</p>
                        <div class="explicit" v-if="source.explicit == 1"><span>E</span></div>
                        <span v-if="source.trackNum !== 'null'" v-show="$route.path !== '/albums'" class="track-num-list">{{ source.trackNum }}</span>
                    </div>
                    <span v-if="$route.path == '/artists'">{{source.album}}</span>
                    <span v-if="$route.path == '/albums'">{{source.artist}}</span>
                </div>
                <div class="list-artist" v-if="$route.path == '/songs' || $route.path == '/playlist' || $route.path == '/liked' || $route.path === '/genres'">
                    <p v-for="(item, index) in artists" :key="index">
                        <router-link :to="`/artists?hideTop=true&column=artist&q=${encodeURIComponent(item)}&view=artist_${encodeURIComponent(item)}`">
                            <span class="artist-item">{{item}}<span v-if="index !== artists.length - 1">,</span></span>
                        </router-link>
                    </p>
                </div>
                <p v-if="$route.path == '/songs' || $route.path == '/playlist' || $route.path == '/liked' || $route.path === '/genres'" class="list-album"><router-link :to="`/albums?hideTop=true&column=album&q=${encodeURIComponent(source.album)}&view=album_${encodeURIComponent(source.albumArtist + source.album)}&albumArtist=${encodeURIComponent(source.albumArtist)}`"><span>{{source.album}}</span></router-link></p>
                <i class="ft-icon favourite-icon" @click="handleFavourite" :style="showFavourite">{{ favouriteIcon }}</i>
                <p class="list-duration"><span>{{source.duration}}</span></p>
            </div>
        </li>
        <div v-if="dragOverY >= 22 && dragOverY <= 42" class="drag-indicate-line bottom" />
    </div>
</template>

<script>
import { bus, contextMenuBus } from '../../renderer.js'
import sort from '../../modules/sort.js'
import store from "../../store";

export default {
    props: ['source', 'index', 'selectedItems', 'prev', 'performingMultiDrag'],
    inject: ['updateSelectedItems'],
    computed: {
        isActive() {
            let view = this.$route.query.view
            if (this.source.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView) {
                return "active"
            } else {
                return ""
            }
        },
        listIcon() {
            let view = this.$route.query.view
            if (this.source.id == this.$store.state.audio.currentSong && this.$store.state.audio.paused && view == this.$store.state.nav.playingView) {
                return 'play'
            } else if (this.source.id == this.$store.state.audio.currentSong && this.isIconHover && view == this.$store.state.nav.playingView) {
                return 'pause'
            } else if (this.source.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView) {
                return 'volume-up'
            } else {
                return 'play'
            }
        },
        listIconVisible() {
            let view = this.$route.query.view
            if (this.source.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView || this.isHover) {
                return 'opacity: 1'
            } else {
                return 'opacity: 0'
            }
        },
        favouriteIcon() {
            if (this.$store.state.nav.favouriteSongs.indexOf(this.source.id) != -1) {
                return 'heart-filled'
            } else {
                return 'heart'
            }
        },
        doHighlight() {
            let inIndex = this.selectedItems.indexOf(this.index)
            if (inIndex !== -1) {
                let topIndex = this.selectedItems.indexOf(this.index - 1)
                let bottomIndex = this.selectedItems.indexOf(this.index + 1)
                if (topIndex !== -1 && bottomIndex !== -1) {
                    return 'hactive none'
                }
                if (topIndex !== -1) {
                    return 'hactive notop'
                }
                if (bottomIndex !== -1) {
                    return 'hactive nobottom'
                } else {
                    return 'hactive'
                }
            } else return ''
        },
        isSimple() {
            if (this.$route.path == '/albums') return 'simple albums'
            else if (this.$route.path == '/artists') return 'simple artists'
            else return ''
        },
        showFavourite() {
            if (this.favouriteIcon === 'heart-filled') {
                return 'opacity: 1; color: var(--hl-txt)';
            } else {
                return ''
            }
        }
    },
    data() {
        return {
            isHover: false,
            isIconHover: false,
            dragOverY: -1,
            isThisDragging: false,
            artists: JSON.parse(this.source.allArtists)
        }
    },
    methods: {
        playSong(evt) {
            if (evt && (evt.ctrlKey || evt.shiftKey)) return
            let currentList = []
            this.$store.state.audio.currentList.forEach(f => { currentList.push(f) })
            this.$store.commit('audio/updateCurrentSong', currentList.indexOf(this.source))
            this.$store.commit('audio/genNewQueue', currentList)
            this.$store.dispatch('audio/playSong', this.source)
        },
        decidePlaySong() {
            let view = this.$route.query.view
            if (this.source.id == this.$store.state.audio.currentSong && view == this.$store.state.nav.playingView) {
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
            if (this.source.id == this.$store.state.audio.currentSong) {
                this.isIconHover = true
            }
        },
        listIconHoverLeave() {
            this.isIconHover = false
        },
        handleFavourite() {
            if (this.$store.state.nav.favouriteSongs.indexOf(this.source.id) == -1) {
                this.addToFavourite()
            } else {
                this.removeFromFavourites()
            }
        },
        addToFavourite() {
            window.ipcRenderer.send('addFavourite', this.source.id)
        },
        removeFromFavourites() {
            window.ipcRenderer.send('removeFavourite', this.source.id)
        },
        select(evt) {
            if (evt.which == 1) {
                bus.$emit('selected', [evt, this.index])
            } else if (evt.which == 3) {
                contextMenuBus.$emit('selected', [evt, this.index])
            }
        },
        drag(evt) {
            if (!evt.dataTransfer) return
            if (this.selectedItems.length > 1) return bus.$emit('multiDrag', evt)
            evt.dataTransfer.setData('ftsong', JSON.stringify([{
                title: this.source.title,
                artist: this.source.artist,
                album: this.source.album,
                id: this.source.id
            }]))
            document.querySelector('#dragInfo').textContent = `${this.source.artist} - ${this.source.title}`
            evt.dataTransfer.setDragImage(document.querySelector('.drag-detail'), -15, 10)
            this.isThisDragging = true
        },
        stopDrag() {
            bus.$emit('stopDrag')
            this.isThisDragging = false
        },
        songDragOver(evt) {
            evt.preventDefault()
            if (this.$route.path != '/playlist') return
            if (evt.dataTransfer && evt.dataTransfer.types[0] === 'ftsong') {
                evt.dataTransfer.dropEffect = 'copy'
            } else if (evt.dataTransfer) {
                evt.dataTransfer.dropEffect = 'none'
            }
            if (this.isThisDragging) {
                this.dragOverY = -1
            } else {
                this.dragOverY = evt.layerY
            }
        },
        songDragLeave() {
            if (this.$route.path != '/playlist') return
            this.dragOverY = -1
        },
        async songDragFinish(evt) {
            evt.preventDefault()
            this.isThisDragging = false
            if (this.$route.path !== '/playlist') return
            let songs = evt.dataTransfer.getData('ftsong')
            if (songs === '') return
            songs = JSON.parse(songs)
            const playlist = await window.ipcRenderer.invoke('getSpecificPlaylist', this.$route.query.id)
            const songIds = JSON.parse(playlist[0].songIds)
            let sortedPlaylistSongs = sort.sortArrayNum(songIds, 'position')
            const currentSong = songIds.find(item => item.id === this.source.id).position
            let newStartPos = this.dragOverY >= 0 && this.dragOverY <= 21 ? currentSong : currentSong + 1
            const ogPos = songIds.find(item => item.id === songs[0].id).position
            if (ogPos === currentSong) return
            if (currentSong > ogPos) {
                newStartPos = this.dragOverY >= 0 && this.dragOverY <= 21 ? currentSong - 1 : currentSong
            }
            const toBeUpdated = sortedPlaylistSongs.find(item => item.id === songs[0].id)
            toBeUpdated.position = newStartPos

            // i think this is working now?? need to test it more.
            if (newStartPos > ogPos) {
                let checkIndex = ogPos
                for (let i = ogPos; i < newStartPos + 1; i++) {
                    if (sortedPlaylistSongs[i].id === toBeUpdated.id) {
                        checkIndex++
                        continue
                    }
                    sortedPlaylistSongs[checkIndex].position = checkIndex - 1
                    checkIndex++
                }
            } else {
                let checkIndex = newStartPos
                for (let i = newStartPos; i < sortedPlaylistSongs.length - 1; i++) {
                    if (sortedPlaylistSongs[i].id === toBeUpdated.id) {
                        checkIndex--
                        break
                    }
                    sortedPlaylistSongs[checkIndex].position = checkIndex + 1
                    checkIndex++
                }
            }
            //toBeUpdated.position = newStartPos

            sortedPlaylistSongs = sort.sortArrayNum(sortedPlaylistSongs, 'position')
            window.ipcRenderer.invoke('updatePlaylist', {
                column: 'songids',
                id: playlist[0].id,
                data: JSON.stringify(sortedPlaylistSongs)
            })
            this.dragOverY = -1
            this.updateSelectedItems([newStartPos])
            const ids = []
            sortedPlaylistSongs.forEach(song => {
                ids.push(song.id)
            })
            const updatedSongs = await window.ipcRenderer.invoke('getSomeFromColumnMatches', ids)
            const sortedSongsToUse = []
            sortedPlaylistSongs.forEach(song => {
                sortedSongsToUse.push(updatedSongs[0].find(item => item.id === song.id))
            })
            store.commit('audio/updateCurrentListNoSort', sortedSongsToUse)
        }
    }
}
</script>

<style lang="scss" scoped>
.results-link {
    overflow: hidden;
    position: relative;
    height: 42px;
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
    justify-items: center;
    column-gap: 5px;
    transition: .25s;
    transition-property: margin-left;
    border-radius: 10px;
}

.results-link.simple {
    height: 55px;
}

.results-link.simple.albums {
    grid-template-columns: 40px 40px 40px 1fr;
}

.drag-indicate-line {
    width: calc(100% - 40px);
    height: 2px;
    background-color: var(--hl-txt);
    position: absolute;
}

li:hover {
    background: #ffffff18;
}

li.nohover:hover {
    background: none;
}

.results-link.hactive {
    background: #ffffff36;
}

.results-link.hactive:hover {
    background: #ffffff22;
}

.results-link.hactive.notop {
    border-radius: 0px 0px 10px 10px;
}

.results-link.hactive.nobottom {
    border-radius: 10px 10px 0px 0px;
}

.results-link.hactive.none {
    border-radius: 0px;
}

html.light {
    li:hover {
        background: #00000010;
    }
    
    .results-link.hactive {
        background: #00000028;
    }
    
    .results-link.hactive:hover {
        background: #00000022;
    }
}

.play-pause {
    font-size: 24px !important;
    padding: 0;
    cursor: pointer;
    opacity: 0;
}

.play-pause:hover {
    opacity: .5 !important;
}

.results-link.active {
    .list-title {
        color: var(--hl-txt);
    }
}

.results-link.active a {
    //color: var(--hl-txt);
}

.artist-title-album {
    display: grid;
    column-gap: 20px;
    grid-template-columns: 3fr 2fr 2fr 20px 0fr;
    align-items: center;
    width: calc(100% - 25px);
    font-size: 14px;
    height: 100%;
}

.results-link.simple .artist-title-album {
    grid-template-columns: 3fr 20px 0fr;
}

.artist-title-album p {
    margin-top: 0px;
    margin-bottom: 0px;
}

.list-title {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
    white-space: nowrap;
    display: flex;
    align-items: center;

    .title-name {
        display: flex;
        align-items: center;
    }
}

.results-link.simple .list-title {
    display: block;
}

.results-link.simple .list-title {
    p {
        margin: 0 0 5px;
        font-size: 15px;
    }

    span {
        font-size: 12px;
        opacity: 0.75;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.list-artist,
.list-album,
.list-duration {
    overflow: hidden;
    pointer-events: none;
    white-space: nowrap;
}

.list-title, .list-artist, .list-album {
    mask-image: -webkit-linear-gradient(180deg, transparent, #000 25px);
}

.list-artist {
    display: flex;

    .artist-item {
        margin-right: 4px;

        span {
            color: var(--text);
        }
    }
}

.list-artist span, .list-album span, .list-duration span {
    opacity: 0.8;
}

.list-duration {
    text-align: right;
    min-width: 40px;
}

.list-artist span, .list-album span {
    pointer-events: all;
}

.list-artist span:hover, .list-album span:hover {
    color: var(--hl-txt);
    text-decoration: underline;
    cursor: pointer;
    opacity: 1;
}

.list-artist span:active, .list-album span:active {
    color: var(--hl-txt);
    text-decoration: underline;
    opacity: .8;
}

.favourite-icon {
    font-size: 23px;
    cursor: pointer;
    opacity: 0;
    min-width: 23px;
    border-radius: 100px;
}

.results-link:hover .favourite-icon, .results-link.hactive .favourite-icon {
    opacity: 0.5;
}

.favourite-icon:hover {
    opacity: 1;
}

.track-num {
    margin: 0 10px;
    font-size: 16px;
    opacity: 0.5;
    text-align: center;
    max-width: 20px;
    width: 20px;
}

.track-num-list {
    margin-left: 15px;
    opacity: 0.5;
}

@media (max-width: 900px) {
    .list-album {
        display: none;
    }
    .artist-title-album {
        grid-template-columns: 3fr 1.5fr 0fr 20px 0fr;
    }
}

.playing-ani {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 21px;
    height: 15px;
}

.playing-ani .bar {
    min-width: 3px;
    height: 90%;
    background: var(--hl-txt);
    margin: 0 1.5px;
    transition: 0.25s;
    transition-property: transform;
    border-radius: 100px;
    transform: scale(100%);
    transform-origin: bottom;
    will-change: transform;
}

@keyframes barmove {
    from {
        transform: scaleY(15%);
    }
    to {
        transform: scaleY(100%);
    }
}

.playing-ani .bar {
    animation: barmove 0.4s infinite ease-out alternate;
}

.playing-ani .bar.two {
    animation-delay: -0.25s;
}

.playing-ani .bar.one {
    animation-delay: -0.5s;
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
    margin-left: 15px;
    opacity: 0.5;
}

.reduceMotion .playing-ani, html.blur .playing-ani {
    .bar {
        animation: none;
    }
    .bar.one {
        transform: scaleY(70%);
    }
    .bar.two {
        transform: scaleY(100%);
    }
    .bar.three {
        transform: scaleY(50%);
    }
}

.rtl {
    .results-link {
        direction: rtl;
        text-align: right;
    }

    .track-num-list {
        margin-left: 0px;
        margin-right: 15px;
    }

    .list-title, .list-artist, .list-album {
        mask-image: -webkit-linear-gradient(0deg, transparent, #000 25px);
    }
}
</style>