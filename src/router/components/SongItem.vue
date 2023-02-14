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
                <p v-if="source.trackNum !== 'null'" class="track-num">{{source.trackNum}}</p>
                <p v-else class="track-num">-</p>
            </div>
            <div class="artist-title-album" @pointerup="select" @dblclick="playSong">
                <div class="list-title">
                    <p>{{ source.title }}<span v-if="source.trackNum !== 'null'" v-show="$route.path !== '/albums'" class="track-num-list">{{ source.trackNum }}</span></p>
                    <span v-if="$route.path == '/artists'">{{source.album}}</span>
                    <span v-if="$route.path == '/albums'">{{source.artist}}</span>
                </div>
                <p v-if="$route.path == '/' || $route.path == '/playlist'" class="list-artist"><router-link :to="`/artists?hideTop=true&column=artist&q=${encodeURIComponent(source.artist)}&view=artist_${encodeURIComponent(source.artist)}`"><span>{{source.artist}}</span></router-link></p>
                <p v-if="$route.path == '/' || $route.path == '/playlist'" class="list-album"><router-link :to="`/albums?hideTop=true&column=album&q=${encodeURIComponent(source.album)}&view=album_${encodeURIComponent(source.album)}`"><span>{{source.album}}</span></router-link></p>
                <i class="ft-icon favourite-icon" @click="handleFavourite" :style="showFavourite">{{ favouriteIcon }}</i>
                <p class="list-duration"><span>{{source.duration}}</span></p>
            </div>
        </li>
        <div v-if="dragOverY >= 22 && dragOverY <= 42" class="drag-indicate-line bottom" />
    </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import { bus, contextMenuBus } from '@/main'
import sort from '@/modules/sort'

export default {
    props: ['source', 'index', 'selectedItems', 'prev', 'performingMultiDrag'],
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
            dragOverY: -1
        }
    },
    methods: {
        playSong(evt) {
            console.log(this.selectedItems)
            if (evt && (evt.ctrlKey || evt.shiftKey)) return
            let currentList = []
            this.$store.state.audio.currentList.forEach(f => { currentList.push(f) })
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
            ipcRenderer.send('addFavourite', this.source.id)
        },
        removeFromFavourites() {
            ipcRenderer.send('removeFavourite', this.source.id)
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
        },
        stopDrag() {
            bus.$emit('stopDrag')
        },
        songDragOver(evt) {
            evt.preventDefault()
            if (this.$route.path != '/playlist') return
            if (evt.dataTransfer && evt.dataTransfer.types[0] === 'ftsong') {
                evt.dataTransfer.dropEffect = 'copy'
            } else if (evt.dataTransfer) {
                evt.dataTransfer.dropEffect = 'none'
            }
            this.dragOverY = evt.layerY
        },
        songDragLeave() {
            if (this.$route.path != '/playlist') return
            this.dragOverY = -1
        },
        async songDragFinish(evt) {
            evt.preventDefault()
            if (this.$route.path != '/playlist') return
            let songs = evt.dataTransfer.getData('ftsong')
            console.log(evt)
            if (songs === '') return
            songs = JSON.parse(songs)
            const playlist = await ipcRenderer.invoke('getSpecificPlaylist', this.$route.query.id)
            const songIds = JSON.parse(playlist[0].songIds)
            const sortedPlaylistSongs = sort.sortArrayNum(songIds, 'position')
            const currentSong = songIds.find(item => item.id == this.source.id).position
            const newStartPos = this.dragOverY >= 0 && this.dragOverY <= 21 ? currentSong : currentSong + 1
            songs.forEach((song, index) => {
                const item = sortedPlaylistSongs.find(item => item.id == song.id)
                item.position = newStartPos
                const plIndex = sortedPlaylistSongs.indexOf(item)
                console.log(item)
                sortedPlaylistSongs.splice(plIndex, 1)
                sortedPlaylistSongs.splice(newStartPos + index - 1, 0, item)
            })
            console.log(newStartPos + songs.length, sortedPlaylistSongs.length)
            for (let i = newStartPos + songs.length - 1; i < sortedPlaylistSongs.length; i++) {
                console.log(i + "a")
                sortedPlaylistSongs[i].position = sortedPlaylistSongs[i].position + songs.length
            }
            console.log(sortedPlaylistSongs)
            /* ipcRenderer.invoke('updatePlaylist', {
                column: 'songids',
                id: playlist[0].id,
                data: JSON.stringify(sortedPlaylistSongs)
            }) */
            this.dragOverY = -1
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

.results-link.active i {
    opacity: 1;
}

.results-link.active {
    color: var(--hl-txt);

    p, span {
        opacity: 1;
    }
}

.results-link.active a {
    color: var(--hl-txt);
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
    text-overflow: ellipsis;
    pointer-events: none;
    white-space: nowrap;
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
        grid-template-columns: 3fr 2fr 0fr;
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
    height: 15%;
    background: var(--hl-txt);
    margin: 0 1.5px;
    transition: 0.25s;
    transition-property: height;
    border-radius: 10px;
}

@keyframes barmove {
    from {
        height: 15%;
    }
    to {
        height: 90%;
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

.reduce-motion {
    .playing-ani {
        .bar {
            animation: none;
        }
        .bar.one {
            height: 70%;
        }
        .bar.two {
            height: 45%;
        }
        .bar.three {
            height: 100%;
        }
    }
}
</style>