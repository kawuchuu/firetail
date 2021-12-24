<template>
    <div class="root-sl" :class="isSimple" v-show="list.length > 0 || $route.path == '/' || $route.path === '/playlist'">
        <div class="standard" v-if="$route.path == '/' || $route.path == '/playlist'">
            <div v-if="$route.path == '/'" class="bg-gradient">
                <div class="bg-banner"></div>
            </div>
        </div>
        <div class="sticky-bg" :class="currentScroll">
            <div class="bg-inner">
                <h3>Songs</h3>
            </div>
        </div>
        <div class="top-title" ref="topTitle">
            <div v-if="$route.path == '/playlist'" class="tab-album-art"></div>
            <div v-if="$route.path == '/albums'" class="tab-album-art" :style="getAlbumImage"></div>
            <div v-if="$route.path == '/artists'" class="tab-album-art" :style="getArtistImage"></div>
            <div ref="topTitle" class="top-title-text">
                <!-- <h1 v-if="$route.path == '/artists' && list[0]" ref="header" :style="topTitleSize" class="top-header">{{list[0].artist}}</h1>
                <h1 v-else-if="$route.path == '/albums' && list[0]" ref="header" :style="topTitleSize" class="top-header">{{list[0].album}}</h1> -->
                <h1 ref="header" :style="topTitleSize" class="top-header">{{ topTitleText }}</h1>
                <!-- <h1 ref="headerTEST" class="top-header-test">{{ topTitleText }}</h1> -->
                <p v-if="$route.path == '/albums' && list[0] && list[0].year">{{ list[0].year }} • {{ screenCountNum }} {{ $tc('topTitle.countTypeSongs', parseInt(screenCountNum)) }}</p>
                <p v-else>{{ screenCountNum }} {{ $tc('topTitle.countTypeSongs', parseInt(screenCountNum)) }}</p>
            </div>
        </div>
        <div class="root-wrapper">
            <div v-if="$route.path == '/'" class="list-gradient-fade"></div>
            <div class="list-section" :class="currentScroll">
                <i class="material-icons-outlined play-pause" style="visibility: hidden;">play_arrow</i>
                <i class="ft-icon favourite-icon" style="visibility: hidden">favourite</i>
                <div class="section" v-if="$route.path == '/albums'">
                    <i class="ft-icon disc-num">albums</i>
                </div>
                <div class="section" v-if="$route.path == '/albums'">
                    <p class="track-num">#</p>
                </div>
                <div class="artist-title-album section">
                    <p class="list-title">{{ $t('songList.listTitle') }}</p>
                    <p v-if="$route.path == '/' || $route.path == '/playlist'" class="list-artist">{{ $t('songList.listArtist') }}</p>
                    <p v-if="$route.path == '/' || $route.path == '/playlist'" class="list-album">{{ $t('songList.listAlbum') }}</p>
                    <p class="list-duration"><i class="material-icons-outlined">schedule</i></p>
                </div>
                <div class="sec-border"></div>
            </div>
            <div class="wrapper">
                <p v-if="list.length == 0 && $route.path === '/'" style="margin-left: 50px;">No songs have been imported yet. Click Add Songs at the top to import some!</p>
                <p v-else-if="list.length === 0 && $route.path === '/playlist'" style="margin-left: 50px">No songs have been added to this playlist. You should drag some to this playlist's button on the side bar!</p>
                <div v-if="$route.path !== '/'">
                    <SongItem v-for="(item, index) in list" :source="item" :key="item.id" :selectedItems="selectedItems" :index="index"/>
                </div>
                <div v-if="$route.path === '/'">
                    <virtual-list
                        :data-key="'id'"
                        :data-sources="list"
                        :data-component="sItem"
                        :page-mode="true"
                        :page-mode-el="'#main-container'"
                        :top-threshold="-200"
                        :extra-props="{selectedItems: selectedItems}"
                        :estimate-size="itemSizeCheck"
                        :keeps="40"
                        @selected="select"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SongItem from './SongItem'
import {bus} from '@/main'
import { mapState } from 'vuex'
import { ipcRenderer } from 'electron'
import sort from '@/modules/sort'
import axios from 'axios'

export default {
    components: {
        SongItem
    },
    data() {
        return {
            selectedItems: [],
            lastSelectedIndex: 0,
            sItem: SongItem,
            titleSizes: {
                large: '5.5rem',
                medium: '3.5rem',
                small: '2.4rem' 
            },
            activeSize: 'large',
            topTitleTxt: 'Songs',
            justChanged: false
        }
    },
    computed: {
        ...mapState('audio', {
            list: function(state) {
                if (this.$route.path == '/albums') {
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
            }
        }),
        ...mapState('nav', {
            screenCountNum: state => state.screenCountNum,
            currentScroll: function(state) {
                if (this.$route.path === '/' && state.scrolled > 215 || this.$route.path !== '/' && state.scrolled > 282) {
                    return 'sticky'
                } else {
                    return ''
                }
            }
        }),
        ...mapState('playlist', {
            playlist: state => state.currentPlaylist
        }),
        isSimple() {
            if (this.$route.path == '/albums') return 'simple albums'
            else if (this.$route.path == '/artists') return 'simple artist'
            else if (this.$route.path == '/playlist') return 'playlist'
            else return ''
        },
        topTitleSize() {
            return `font-size: ${this.titleSizes[this.activeSize]}`
        },
        topTitleText() {
            switch(this.$route.path) {
                case '/': {
                    return 'Songs'
                }
                case '/albums': {
                    if (!this.list[0]) return 'Songs'
                    else return this.list[0].album
                }
                case '/artists': {
                    if (!this.list[0]) return 'Songs'
                    else return this.list[0].artist
                }
                case '/playlist': {
                    return this.playlist.name
                }
                default: {
                    return 'Songs'
                }
            }
        },
        itemSizeCheck() {
            if (this.$route.path == '/') {
                return 42
            } else {
                return 55
            }
        }
    },
    asyncComputed: {
        ...mapState('audio', {
            async getArtistImage() {
                if (this.$route.path != '/artists' || this.list.length == 0) return ''
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
                if (img == '') {
                    return ''
                } else {
                    return `background-image: url('${img}')`
                }
            },
            async getAlbumImage() {
                if (this.$route.path != '/albums' || this.list.length == 0) {
                    this.$store.commit('nav/updateAlbumViewCurrentArt', '')
                    return ''
                }
                let port = this.$store.state.nav.port
                let song = this.$store.state.audio.currentList[0]
                if (!song) {
                    this.$store.commit('nav/updateAlbumViewCurrentArt', '')
                    return ''
                }
                if (song.hasImage == 1) {
                    let artistAlbum = `http://localhost:${port}/${(song.artist + song.album).replace(/[.:<>"*?/{}()'|[\]\\]/g, '_')}.jpg`;
                    this.$store.commit('nav/updateAlbumViewCurrentArt', artistAlbum)
                    return `background-image: url('${artistAlbum}')`
                } else {
                    this.$store.commit('nav/updateAlbumViewCurrentArt', '')
                    return ''
                }
            }
        })
    },
    methods: {
        select(evt) {
            let getIndex = this.selectedItems.indexOf(evt[1])
            if (evt[0].which == 1) {
                if (evt[0].ctrlKey || evt[0].metaKey) {
                    if (getIndex == -1) {
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
                        if (isNegative == -1) {
                            this.selectedItems.push(evt[1] + i)
                        } else {
                            this.selectedItems.push(evt[1] - i)
                        }
                    }
                } else {
                    this.selectedItems = [evt[1]]
                    this.lastSelectedIndex = evt[1]
                }
            } else if (evt[0].which == 3) {
                if (getIndex == -1) {
                    this.selectedItems = [evt[1]]
                    this.lastSelectedIndex = evt[1]
                }
                let favCompare = false
                const favourites = this.$store.state.nav.favouriteSongs
                if (this.selectedItems.length > 1) {
                    this.selectedItems.forEach(f => {
                        if (favourites.indexOf(this.list[f].id) == -1) {
                            favCompare = true
                            return
                        }
                    })
                } else if (favourites.indexOf(this.list[evt[1]].id) == -1) {
                    favCompare = true
                }
                const favouriteOnClick = () => {
                    this.selectedItems.forEach(f => {
                        const item = this.list[f].id
                        if (favCompare) {
                            if (favourites.indexOf(item) == -1) {
                                ipcRenderer.send('addFavourite', item)
                            }
                        } else {
                            ipcRenderer.send('removeFavourite', item)
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
                    ipcRenderer.send('deleteSome', idsToDelete)
                    this.selectedItems.splice(0)
                    this.lastSelectedIndex = 0
                }
                let menuItems = [
                    {name: 'Add to queue', type: 'button'},
                    {type: 'divider', hide: [this.selectedItems.length == 1 ? false : true, this.list[evt[1]].artist == 'Unknown Artist' && this.list[evt[1]].album == 'Unknown Album']},
                    {name: 'Go to artist', type: 'button', hide: [this.selectedItems.length == 1 ? false : true, this.$route.path == '/artists', this.list[evt[1]].artist == 'Unknown Artist'], onClick: goToArtist},
                    {name: 'Go to album', type: 'button', hide: [this.selectedItems.length == 1 ? false : true, this.$route.path == '/albums', this.list[evt[1]].album == 'Unknown Album'], onClick: goToAlbum},
                    {type: 'divider'},
                    {name: favCompare ? 'Add to favourites' : 'Remove from favourites', type: 'button', onClick: favouriteOnClick},
                    {name: 'Add to playlist', type: 'button'},
                    {type: 'divider'},
                    {name: 'Remove from library', type: 'button', style: 'dangerous', onClick: deleteSongs}
                ]
                bus.$emit('updateitems', {
                    items: menuItems,
                    position: {
                        clientX: evt[0].clientX,
                        clientY: evt[0].clientY
                    }
                })
            }
        }
    },
    mounted() {
        bus.$on('selected', evt => {
            this.select(evt)
        })
        /* 
            Please excuse this hardcoded mess
            Currently looping if not large, using unnecessary resources... needs fix!!
            Update 03/11/2021: a bit of tweaking seems to have resolved this issue :)
            Was motivated to fix since it was draining my laptop's battery
        */
        const topHeader = this.$refs.header
        const topTitle = this.$refs.topTitle
        const doTextResize = () => {
            topHeader.style.fontSize = this.titleSizes.large
            if (topHeader.getBoundingClientRect().height > 190) {
                topHeader.style.fontSize = this.titleSizes.medium
            }
            if (topHeader.getBoundingClientRect().height > 140 && topHeader.style.fontSize == this.titleSizes.medium) {
                topHeader.style.fontSize = this.titleSizes.small
            }
        }
        const mutationObserver = new MutationObserver((mutations) => {
            mutationObserver.disconnect(topHeader)
            for (let mutation of mutations) {
                if (mutation.type == 'attributes') {
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
    }
}
</script>

<style lang="scss" scoped>
.wrapper {
    padding: 5px 20px;
}

.bg-gradient {
    position: absolute;
    width: 100%;
    height: 450px;
    top: 0;
    z-index: 0;
}

.list-gradient-fade {
    width: 100%;
    height: 300px;
    position: absolute;
    background: linear-gradient(#12121233, transparent);
}

.artist-title-album {
    display: grid;
    column-gap: 30px;
    grid-template-columns: 3fr 2fr 2fr 0fr;
    width: calc(100% - 25px);
}

.simple .artist-title-album {
    grid-template-columns: 3fr 0fr;
}

.artist-title-album p {
    margin-top: 0px;
    margin-bottom: 0px;
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
    font-size: 18px;
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
    display: grid;
    grid-template-columns: 40px 40px 1fr;
    align-items: center;
    justify-items: center;
    column-gap: 5px;
    top: 0;
    z-index: 3;
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 1px;
    border-bottom: solid 1px #ffffff3f;
    position: sticky;
    margin: 0px 20px;
}

.simple.albums .list-section {
    grid-template-columns: 40px 40px 40px 40px 1fr;
}

.list-section p {
    transform: translateY(3px);
}

.list-section.sticky {
    margin: 0;
    padding: 0px 20px;
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
    font-size: 12px;
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
    padding: 50px 100px 30px;
    padding-left: 75px;
    display: flex;
    align-items: flex-end;
    //background: linear-gradient(#e74e8e, #e74e8ea6);
    z-index: 1;
    position: relative;
}

.top-title-text {
    max-width: calc(100% - 200px);
    padding-bottom: 10px;
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
    margin: 0px;
    margin-top: 5px;
    opacity: .75;
}

.tab-album-art {
    min-width: 200px;
    height: 200px;
    background-color: #000000b3;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('../../assets/no_artist.svg');
    border-radius: 100px;
    margin-right: 40px;
}

.albums .tab-album-art, .playlist .tab-album-art {
    border-radius: 5px;
    background-image: url('../../assets/no_album.svg');
}

.sticky-bg {
    position: fixed;
    top: 0;
    height: 81px;
    width: calc(100% - 225px - 16px);
    background: black;
    z-index: 3;
    opacity: 0;
    transition: 0.15s;
    transition-property: opacity;
    pointer-events: all;

    .bg-inner {
        height: 50px;
        display: flex;
        align-items: center;

        h3 {
            margin: 0 110px;
            font-size: 24px;
            letter-spacing: -1px;
        }
    }
}

.sticky-bg.sticky {
    opacity: 1;
}
@media (max-width: 900px) {
    .list-album {
        display: none;
    }
    .artist-title-album {
        grid-template-columns: 3fr 2fr 0fr;
    }
}
</style>