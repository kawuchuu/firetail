<template>
    <div class="root-sl" :class="isSimple" v-show="list.length > 0 || $route.path === '/songs' || $route.path === '/playlist' || $route.path === '/liked'">
        <div class="standard" v-if="$route.path === '/songs' || $route.path === '/playlist'">
            <div class="special-gradient-bg-wrapper">
                <div class="bg-gradient-layer"></div>
                <div class="bg-noise" />
                <div class="bg-image" :style="parallax" />
            </div>
        </div>
        <div class="bg-inner" :class="currentScroll">
            <h3>{{ topTitleText }}</h3>
        </div>
        <div class="root-wrapper">
            <div class="top-title" ref="topTitle">
                <div v-if="$route.path === '/albums'" class="tab-album-art" :style="getAlbumImage"></div>
                <div v-if="$route.path === '/artists'" class="tab-album-art" :style="getArtistImage"></div>
                <div v-if="$route.path === '/playlist'" class="tab-album-art" :style="getPlaylistImage"></div>
                <div ref="topTitle" class="top-title-text">
                    <p v-if="$route.path === '/albums'" class="album-type">{{ albumType }}</p>
                    <h1 ref="header" :style="topTitleSize" class="top-header" v-show="topTitleText !== ''">{{ topTitleText }}</h1>
                    <p v-if="$route.path === '/playlist' && playlist.desc">{{ playlist.desc }}</p>
                    <p v-if="$route.path === '/albums' && list[0]">
                      <span v-if="list[0].albumArtist">{{ list[0].albumArtist }} • </span>
                      <span v-if="list[0].year">{{ list[0].year }}</span>
<!--                      <span v-if="list[0].genre"> • <span v-for="item in JSON.parse(list[0].genre)">{{`item`}}</span></span>-->
                    </p>
                    <p v-else>{{ $tc('TOP_TITLE.COUNT_TYPE_SONGS', screenCountNum, { count: $n(screenCountNum) })}}</p>
                </div>
            </div>

            <!-- <div class="bottom-row">
                <div class="round-button"><i class="ft-icon">play</i></div>
                <div class="round-button"><i class="ft-icon">shuffle</i></div>
            </div> -->
            <div class="sticky-bg" :class="currentScroll">
                <div class="list-section" :class="currentScroll">
                    <i class="ft-icon play-pause" style="visibility: hidden;">play</i>
                    <div class="section" v-if="$route.path === '/albums'">
                        <i class="ft-icon disc-num">albums</i>
                    </div>
                    <div class="section" v-if="$route.path === '/albums'">
                        <p class="track-num">#</p>
                    </div>
                        <div class="artist-title-album section">
                            <p class="list-title">{{ $t('SONG_LIST.LIST_TITLE') }}</p>
                            <p v-if="$route.path === '/songs' || $route.path === '/playlist' || $route.path === '/liked' || $route.path === '/genres'" class="list-artist">{{ $t('SONG_LIST.LIST_ARTIST') }}</p>
                            <p v-if="$route.path === '/songs' || $route.path === '/playlist' || $route.path === '/liked' || $route.path === '/genres'" class="list-album">{{ $t('SONG_LIST.LIST_ALBUM') }}</p>
                            <i class="ft-icon favourite-icon" style="visibility: hidden">favourite</i>
                            <p class="list-duration"><i class="ft-icon">clock</i></p>
                        </div>
                    <div class="sec-border"></div>
                </div>
            </div>
            <p v-if="false">{{$route.path}} || {{$route.path === '/songs' || $route.path === '/playlist'}} || {{ $route.path !== '/songs' || $route.path !== '/playlist' }}</p>
            <div class="wrapper">
                <p v-if="list.length === 0 && !$store.state.audio.isLoadingSongs && $route.path === '/songs'" style="margin-left: 60px;">No songs have been added to Firetail's library. Drag some into this window to get started!</p>
                <p v-else-if="list.length === 0 && !$store.state.audio.isLoadingSongs && $route.path === '/playlist'" style="margin-left: 60px">No songs have been added to this playlist. You should drag some to this playlist's button on the side bar!</p>
                <p v-else-if="list.length === 0 && !$store.state.audio.isLoadingSongs && $route.path === '/liked'" style="margin-left: 60px">To add a favourite song, press the heart icon next to a song.</p>
                <virtual-list
                    :data-key="'id'"
                    :data-sources="list"
                    :data-component="sItem"
                    :page-mode="true"
                    :page-mode-el="'#main-container'"
                    :extra-props="{selectedItems: selectedItems}"
                    :estimate-size="itemSizeCheck"
                    :keeps="40"
                    ref="virtualList"
                    @selected="select"
                />
                <div class="extra-list-info">
                  <p>{{ $tc('TOP_TITLE.COUNT_TYPE_SONGS', screenCountNum, { count: $n(screenCountNum) })}}</p>
                  <p><span v-if="totalDuration.hours > 0">{{ $tc('TOP_TITLE.TIME.HOURS', totalDuration.hours, { count: $n(totalDuration.hours) })}}, </span><span v-if="totalDuration.mins > 0">{{ $tc('TOP_TITLE.TIME.MINUTES', totalDuration.mins, { count: $n(totalDuration.mins) })}}, </span><span>{{ $tc('TOP_TITLE.TIME.SECONDS', totalDuration.secs, { count: $n(totalDuration.secs) })}}</span></p>
                </div>
                <div class="fixed-songload" v-if="list.length < 1 && $store.state.audio.isLoadingSongs">
                    <div class="inner-songload">
                        <SongLoadItem v-for="index in 30" :key="index" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SongItem from './SongItem.vue'
import SongLoadItem from './SongLoadItem.vue'
import { bus, contextMenuBus } from '../../renderer.js'
import { mapState } from 'vuex'
import sort from '../../modules/sort.js'
import axios from 'axios'
import store from "../../store";

export default {
    components: {
        SongItem,
        SongLoadItem
    },
    data() {
        return {
            selectedItems: [],
            lastSelectedIndex: 0,
            sItem: SongItem,
            titleSizes: {
                large: '5.2rem',
                medium: '3.5rem',
                small: '2.4rem' 
            },
            activeSize: 'large',
            topTitleTxt: this.$t('ROUTER.ALL_SONGS'),
            justChanged: false,
            performingMultiDrag: false,
            routeQuery: this.$route.query,
        }
    },
    computed: {
        ...mapState('audio', {
            list: function(state) {
                if (this.$route.path === '/albums') {
                    let doSort = state.currentList;
                    doSort = sort.sortArray(doSort, 'title')
                    doSort.sort(function (a, b) {
                        return a.trackNum - b.trackNum
                    });
                    doSort.sort(function (a, b) {
                        return a.disc - b.disc
                    })
                    return doSort
                } else {
                    return state.currentList
                }
            },
            totalDuration: state => state.currentListDurNoZero
        }),
        ...mapState('nav', {
            screenCountNum: state => state.screenCountNum,
            currentScroll: function(state) {
                if ((this.$route.path === '/songs' || this.$route.path === '/genres') && state.scrolled > 174 || this.$route.path !== '/songs' && state.scrolled > 250) {
                    return 'sticky'
                } else {
                    return ''
                }
            },
            parallax: state => {
                const performance = document.documentElement.classList.contains('performance')
                if (performance) return ''
                // helps prevent it jumping around too much when scrolling fast
                else if (state.scrolled > 550) return ''
                let opacity = (state.scrolled / 3) / 100
                //console.log(opacity)
                return `transform: translateY(${state.scrolled / 2.5}px)`
            }
        }),
        ...mapState('playlist', {
            playlist: state => state.currentPlaylist
        }),
        isSimple() {
            if (this.$route.path === '/albums') return 'simple albums'
            else if (this.$route.path === '/artists') return 'simple artist'
            else if (this.$route.path === '/playlist') return 'playlist'
            else return ''
        },
        topTitleSize() {
            return `font-size: ${this.titleSizes[this.activeSize]}`
        },
        topTitleText() {
            switch(this.$route.path) {
                case '/': {
                    return this.$t('ROUTER.ALL_SONGS')
                }
                case '/albums': {
                    if (!this.list[0]) return ''
                    else return this.list[0].album
                }
                case '/artists': {
                    if (!this.list[0]) return ''
                    else return this.list[0].artist
                }
                case '/playlist': {
                    return this.playlist.name
                }
                case '/liked': {
                    return this.$t('ROUTER.FAVOURITES')
                }
                case '/genres': {
                    return this.$route.query.genre
                }
                default: {
                    return this.$t('ROUTER.ALL_SONGS')
                }
            }
        },
        itemSizeCheck() {
            if (this.$route.path === '/') {
                return 42
            } else {
                return 55
            }
        },
        getPlaylistImage() {
            if (this.$route.path !== '/playlist' || this.playlist.hasImage === 0) {
                this.$store.commit('nav/updateAlbumViewCurrentArt', '')
                return ''
            }
            if (this.playlist.hasImage === 1) {
                const port = this.$store.state.nav.port
                const image = `http://localhost:${port}/images/playlist/${this.playlist.id}.jpg`
                this.$store.commit('nav/updateAlbumViewCurrentArt', image)
                return `background-image: url('${image}')`
            } else return ''
        },
        getAlbumImage() {
            if (this.$route.path !== '/albums' || this.list.length === 0) {
                this.$store.commit('nav/updateAlbumViewCurrentArt', '')
                return ''
            }
            let port = this.$store.state.nav.port
            let song = this.$store.state.audio.currentList[0]
            if (!song) {
                this.$store.commit('nav/updateAlbumViewCurrentArt', '')
                return ''
            }
            if (song.hasImage === 1) {
                let artistAlbum = `http://localhost:${port}/images/${(song.albumArtist + song.album).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> {}[\]\\/]/gi, '')}.jpg`;
                this.$store.commit('nav/updateAlbumViewCurrentArt', artistAlbum)
                return `background-image: url('${artistAlbum}')`
            } else {
                this.$store.commit('nav/updateAlbumViewCurrentArt', '')
                return ''
            }
        },
        albumType() {
            if ((this.list.length >= 1 && this.list.length <= 3) || (this.totalDuration.total < 600 && this.list.length <= 6)) return 'Single'
            else if (this.list.length <= 6 && this.totalDuration.total < 1800) return 'EP'
            else return 'Album'
        }
    },
    asyncComputed: {
        ...mapState('audio', {
            async getArtistImage() {
                if (this.$route.path !== '/artists' || this.list.length === 0) return ''
                let token = localStorage.getItem('sp-token')
                let artist = this.list[0].artist
                if (!token) return
                let resp = await axios({
                    method: 'GET',
                    url: 'https://api.spotify.com/v1/search',
                    params: {
                        q: artist,
                        type: 'artist',
                        limit: 1
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                let img = ''
                try {
                    img = resp.data.artists.items[0].images[1].url
                } catch(err) {
                    console.warn("Image doesn't exist for " + artist)
                }
                if (img === '') {
                    return ''
                } else {
                    return `background-image: url('${img}')`
                }
            }
        })
    },
    methods: {
        multiDrag(evt) {
            this.performingMultiDrag = true
            const songsToSelect = []
            this.selectedItems.forEach(songIndex => {
                const song = this.list[songIndex]
                songsToSelect.push({
                    title: song.title,
                    artist: song.artist,
                    album: song.album,
                    id: song.id
                })
            })
            evt.dataTransfer.setData('ftsong', JSON.stringify(songsToSelect))
            document.querySelector('#dragInfo').textContent = `${songsToSelect[0].artist} - ${songsToSelect[0].title} + ${songsToSelect.length - 1} more songs`
            evt.dataTransfer.setDragImage(document.querySelector('.drag-detail'), -15, 10)
        },
        contextMenu(evt) {
            let getIndex = this.selectedItems.indexOf(evt[1])
            if (getIndex === -1) {
                this.selectedItems = [evt[1]]
                this.lastSelectedIndex = evt[1]
            }
            let favCompare = false
            const favourites = this.$store.state.nav.favouriteSongs
            if (this.selectedItems.length > 1) {
                this.selectedItems.forEach(f => {
                    if (favourites.indexOf(this.list[f].id) === -1) {
                        favCompare = true
                    }
                })
            } else if (favourites.indexOf(this.list[evt[1]].id) === -1) {
                favCompare = true
            }
            const favouriteOnClick = () => {
                this.selectedItems.forEach(f => {
                    const item = this.list[f].id
                    if (favCompare) {
                        if (favourites.indexOf(item) === -1) {
                            window.ipcRenderer.send('addFavourite', item)
                        }
                    } else {
                        window.ipcRenderer.send('removeFavourite', item)
                    }
                })
            }
            const goToArtist = () => {
                if (this.list[evt[1]].artist) {
                    let artist = encodeURIComponent(this.list[evt[1]].artist)
                    this.$router.push(`/artists?hideTop=true&column=artist&q=${artist}&view=artist_${artist}`)
                }
            }
            const goToAlbum = () => {
                if (this.list[evt[1]].album) {
                    let album = encodeURIComponent(this.list[evt[1]].album)
                    this.$router.push(`/albums?hideTop=true&column=album&q=${album}&view=album_${album}`)
                }
            }
            const deleteSongs = () => {
                let idsToDelete = []
                this.selectedItems.forEach(index => {
                    idsToDelete.push(this.list[index].id)
                })
                window.ipcRenderer.send('deleteSome', idsToDelete)
                this.selectedItems.splice(0)
                this.lastSelectedIndex = 0
            }
            const removeFromPlaylist = async () => {
                const playlist = await window.ipcRenderer.invoke('getSpecificPlaylist', this.$route.query.id)
                const songIds = JSON.parse(playlist[0].songIds)
                this.selectedItems.forEach(index => {
                    songIds.splice(songIds.indexOf(songIds.find(item => item.id === this.list[index].id)), 1)
                })
                for (const index in songIds) {
                    songIds[index].position = index
                }
                console.log(songIds)
                await window.ipcRenderer.invoke('updatePlaylist', {
                    column: 'songids',
                    id: this.playlist.id,
                    data: JSON.stringify(songIds)
                })
                const ids = []
                songIds.forEach(song => {
                    ids.push(song.id)
                })
                const updatedSongs = await window.ipcRenderer.invoke('getSomeFromColumnMatches', ids)
                const sortedSongsToUse = []
                songIds.forEach(song => {
                    sortedSongsToUse.push(updatedSongs[0].find(item => item.id === song.id))
                })
                store.commit('audio/updateCurrentListNoSort', sortedSongsToUse)
                this.selectedItems = []
            }
            const revealInFileExplorer = () => {
                window.ipcRenderer.invoke('open-file-in-explorer', this.list[evt[1]].path)
            }
            let menuItems = [
                /*{label: this.$t('CONTEXT_MENU.SONG_LIST_ITEM.ADD_QUEUE'), type: 'normal'},
                {type: 'separator', hide: [this.selectedItems.length !== 1, this.list[evt[1]].artist === 'Unknown Artist' && this.list[evt[1]].album === 'Unknown Album']},
                */{label: this.$t('CONTEXT_MENU.SONG_LIST_ITEM.GO_ARTIST'), type: 'normal', hide: [this.selectedItems.length !== 1, this.$route.path === '/artists', this.list[evt[1]].artist === 'Unknown Artist'], onClick: goToArtist},
                {label: this.$t('CONTEXT_MENU.SONG_LIST_ITEM.GO_ALBUM'), type: 'normal', hide: [this.selectedItems.length !== 1, this.$route.path === '/albums', this.list[evt[1]].album === 'Unknown Album'], onClick: goToAlbum},
                {label: this.$t('CONTEXT_MENU.SONG_LIST_ITEM.VIEW_EXPLORER'), type: 'normal', hide: [this.selectedItems.length !== 1], onClick: revealInFileExplorer},
                {type: 'separator', hide: [this.selectedItems.length !== 1]},
                {label: favCompare ? this.$t('CONTEXT_MENU.SONG_LIST_ITEM.ADD_FAVOURITE') : this.$t('CONTEXT_MENU.SONG_LIST_ITEM.REMOVE_FAVOURITE'), type: 'normal', onClick: favouriteOnClick},
                {label: this.$t('CONTEXT_MENU.SONG_LIST_ITEM.ADD_PLAYLIST'), type: 'normal'},
                {type: 'separator'},
                {label: this.$t('CONTEXT_MENU.SONG_LIST_ITEM.DELETE'), type: 'normal', style: 'dangerous', onClick: deleteSongs},
                {label: "Remove from playlist", type: 'normal', hide: [this.$route.path !== '/playlist'], style: 'dangerous', onClick: removeFromPlaylist}
            ]
            contextMenuBus.$emit('updateitems', {
                items: menuItems,
                position: {
                    clientX: evt[0].clientX,
                    clientY: evt[0].clientY
                }
            })
        },
        select(evt) {
            let getIndex = this.selectedItems.indexOf(evt[1])
            if (evt[0].which === 1) {
                if (evt[0].ctrlKey || evt[0].metaKey) {
                    if (getIndex === -1) {
                        this.selectedItems.push(evt[1])
                    } else {
                        this.selectedItems.splice(getIndex, 1)
                    }
                    this.lastSelectedIndex = evt[1]
                } else if (evt[0].shiftKey) {
                    this.selectedItems = [this.lastSelectedIndex]
                    let amountBy = evt[1] - this.lastSelectedIndex
                    const isNegative = Math.sign(amountBy)
                    for (let i = 0; i < Math.abs(amountBy); i++) {
                        if (isNegative === -1) {
                            this.selectedItems.push(evt[1] + i)
                        } else {
                            this.selectedItems.push(evt[1] - i)
                        }
                    }
                } else {
                    if (this.performingMultiDrag) return this.performingMultiDrag = false
                    this.selectedItems = [evt[1]]
                    this.lastSelectedIndex = evt[1]
                }
            }
        },
        updateSelectedItems(selectedItems) {
            this.selectedItems = selectedItems
        }
    },
    watch: {
        routeQuery() {
            console.log(this.routeQuery)
            const topHeader = this.$refs.header
            if (topHeader.getBoundingClientRect().height === 0) return
            topHeader.style.fontSize = this.titleSizes.large
            if (topHeader.getBoundingClientRect().height > 190) {
                topHeader.style.fontSize = this.titleSizes.medium
            }
            if (topHeader.getBoundingClientRect().height > 140 && topHeader.style.fontSize === this.titleSizes.medium) {
                topHeader.style.fontSize = this.titleSizes.small
            }
            this.selectedItems = []
            this.$refs.virtualList.reset()
            this.$refs.virtualList.updatePageModeFront()
        }
    },
    provide: function() {
        return {
            updateSelectedItems: this.updateSelectedItems
        }
    },
    destroyed() {
        bus.$off()
    },
    mounted() {
        bus.$on('selected', evt => {
            this.select(evt)
        })
        contextMenuBus.$on('selected', evt => {
            this.contextMenu(evt)
        })
        bus.$on('multiDrag', evt => {
            this.multiDrag(evt)
        })
        bus.$on('stopDrag', () => {
            this.performingMultiDrag = false
        })
        const topHeader = this.$refs.header
        const topTitle = this.$refs.topTitle
        const doTextResize = () => {
            topHeader.style.fontSize = this.titleSizes.large
            if (topHeader.getBoundingClientRect().height > 190) {
                topHeader.style.fontSize = this.titleSizes.medium
            }
            if (topHeader.getBoundingClientRect().height > 140 && topHeader.style.fontSize === this.titleSizes.medium) {
                topHeader.style.fontSize = this.titleSizes.small
            }
        }
        const mutationObserver = new MutationObserver((mutations) => {
            mutationObserver.disconnect(topHeader)
            for (let mutation of mutations) {
                if (mutation.type === 'attributes') {
                    doTextResize()
                }
            }
            mutationObserver.observe(topHeader, {
                attributes: true
            })
        })
        mutationObserver.observe(topHeader, {
            attributes: true
        })
        const resizeObserver = new ResizeObserver(doTextResize)
        resizeObserver.observe(topTitle)
        this.$nextTick(() => {
            this.$refs.virtualList.updatePageModeFront()
            //console.log(this.$refs.virtualList.getScrollSize(), "mounted")
        })
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    padding: 5px 20px;
    position: relative;
    z-index: 2;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    max-height: 450px;
    //background-color: #5e00da;
    background-position: center;
    background-size: 150%;
    background-repeat: no-repeat;
    top: 0;
    z-index: -1;
    overflow: hidden;
    transform: scale(1.3);
    opacity: 0.55;
}

.bg-gradient-layer {
    position: absolute;
    width: 100%;
    height: 600px;
    background: linear-gradient(transparent, var(--bg)), radial-gradient(farthest-corner at 5% 10%, transparent 5%, var(--bg));
    top: 0;
    z-index: 1;
}

.bg-image {
    width: 100%;
    height: 100%;
    max-height: 450px;
    background: linear-gradient(transparent, transparent, var(--bg)), radial-gradient(circle at top, transparent 40%, var(--bg)), url('../../assets/songs-banner-new.png');
    background-size: cover;
    background-position: center 80%;
    z-index: -2;
    position: absolute;
    animation: fadeIn 1s;
}

.special-gradient-bg-wrapper {
    max-height: 600px;
    height: 600px;
    width: 100%;
    overflow: hidden;
    position: absolute;
    top: 0;
}

.special-gradient-bg-wrapper .bg-noise {
    max-height: 600px;
    z-index: 0;
    background-size: 400px;
}

.bg-fade-bottom {
  width: 100%;
  height: 400px;
  background: var(--bg);
  position: absolute;
  top: 420px;
  z-index: 2;
}

.artist-title-album {
    display: grid;
    column-gap: 20px;
    grid-template-columns: 3fr 2fr 2fr 20px 0fr;
    width: calc(100% - 25px);
}

.simple .artist-title-album {
    grid-template-columns: 3fr 40px 0fr;
}

.artist-title-album p {
    margin-top: 0;
    margin-bottom: 0;
}

.list-artist,
.list-album,
.list-duration,
.track-num,
.disc-num {
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
    white-space: nowrap;
}

.list-duration i, .disc-num {
    font-size: 20px;
    padding: 0 6px;
}

.list-duration {
    text-align: right;
    min-width: 40px;
}

div.section .track-num {
    margin: 0;
    transform: none;
}

.list-section {
    overflow: hidden;
    height: 30px;
    width: 100%;
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
    justify-items: center;
    column-gap: 5px;
    top: 0;
    z-index: 3;
    //text-transform: uppercase;
    letter-spacing: 0;
    border-bottom: solid 1px var(--bd);
    position: sticky;
    margin: 0 20px;
}

.simple.albums .list-section {
    grid-template-columns: 40px 40px 40px 1fr;
}

.list-section p {
    transform: translateY(3px);
}

.list-section.sticky {
    margin: 0;
    padding: 0 20px;
    border-bottom: none;
}

.list-section .list-artist:hover, .list-section .list-album:hover, .list-section .list-duration:hover {
    color: var(--text);
    text-decoration: none;
    cursor: default;
    opacity: 1;
}

.list-section .list-artist:active, .list-section .list-album:active, .list-section .list-duration:active {
    color: var(--text);
    text-decoration: none;
    opacity: 1;
}

div.section {
    font-size: 0.9em;
    opacity: .75;
}

.favourite-icon {
    font-size: 20px;
    cursor: pointer;
}

.play-pause {
    font-size: 24px !important;
    padding: 0;
    cursor: pointer;
    opacity: 0;
}

.results-link i, .list-section i {
    padding: 0 7px;
}

.top-title {
    padding: 50px 75px 0;
    display: flex;
    align-items: flex-end;
    //background: linear-gradient(#e74e8e, #e74e8ea6);
    z-index: 1;
    position: relative;
}

.top-title-text {
    max-width: calc(100% - 200px);
    max-height: 200px;
}

.top-header-test {
    position: absolute;
    opacity: 1;
    pointer-events: none;
    padding-right: 100px;
}

.top-title h1 {
    font-size: 6rem;
    margin: 0;
/*     overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; */
    letter-spacing: -0.04em;
}

.top-title p {
    margin: 8px 0;
    opacity: .75;
    font-size: 0.9em;
}

.top-title p:last-child {
    margin-bottom: 0;
}

.tab-album-art {
    min-width: 200px;
    height: 200px;
    background-color: var(--back-bg);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('../../assets/no_artist.svg');
    border-radius: 100px;
    margin-right: 40px;
    box-shadow: 0 0 80px var(--bg-op);
}

.albums .tab-album-art, .playlist .tab-album-art {
    border-radius: 10px;
    background-image: url('../../assets/no_album.svg');
}

.sticky-bg {
    position: sticky;
    width: 100%;
    height: 80px;
    top: 0;
    z-index: 3;
    pointer-events: all;
    border-radius: var(--main-border-radius);
    display: flex;
    align-items: flex-end;
}

.bg-inner.sticky {
    opacity: 1;
    pointer-events: initial;
}

.bg-inner {
    height: 80px;
    opacity: 0;
    width: 100%;
    background: var(--fg-bg);
    position: fixed;
    z-index: 3;
    top: 44px;
    border-radius: 10px 0 0;
    transition: 0.1s opacity;
    border-bottom: solid 1px var(--bd);
    pointer-events: none;

    h3 {
        margin: 15px 78px;
        font-size: 20px;
        letter-spacing: -0.03em;
        font-weight: 600;
    }
}

.artists .bg-inner {
    border-radius: 0;
}

.fixed-songload {
    width: 100%;
    height: calc(100vh - 400px);
    overflow: hidden;

    .inner-songload {
        width: 100%;
    }
}

.darwin .top-header {
    letter-spacing: -0.015em;
}

.darwin .bg-inner h3 {
    letter-spacing: -0.005em;
}

.bottom-row {
    display: flex;
    margin-top: 20px;
    position: relative;
    z-index: 1;
    margin-left: 75px;

    .round-button {
        background: var(--hl-txt);
        min-width: 50px;
        min-height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100px;
        color: black;
        margin-right: 25px;
    }
}

.boldText .top-title h1 {
    font-weight: 800;
}

.extra-list-info {
  margin: 20px 0 20px 55px;
  font-size: 14px;
  opacity: 0.75;

  p {
    margin: 6px 0;
  }
}

@media (max-width: 900px) {
    .list-album {
        display: none;
    }
    .artist-title-album {
        grid-template-columns: 3fr 1.5fr 0fr 20px 0fr;
    }
}

.rtl {
    .top-title-text p {
        direction: ltr;
        text-align: right;
    }

    .tab-album-art {
        margin-right: 0;
        margin-left: 40px;
    }

    .top-title h1, .bg-inner h3 {
        letter-spacing: 0;
    }

    .bg-inner {
        border-radius: 0 10px 0;
    }
}
</style>