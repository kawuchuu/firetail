import { ipcRenderer } from 'electron'
import sort from '../../modules/sort'
import tr from '../../translation'
import store from '..'

const state = () => ({
    navs: [{
        icon: 'home',
        name: tr.t('SIDEBAR.HOME'),
        id: 'homeTab',
        type: 'large_button',
        link: '/home'
    },
/*     {
        icon: 'settings',
        name: tr.t('SIDEBAR.SETTINGS'),
        id: 'settingsTab',
        type: 'large_button',
        link: '/settings'
    }, */
    {
        name: tr.t('SIDEBAR.LIBRARY'),
        type: 'subtitle'
    },
    {
        icon: 'note',
        name: tr.t('SIDEBAR.SONGS'),
        id: 'songsTab',
        type: 'large_button',
        link: `/songs?view=all`
    },
    {
        icon: 'person',
        name: tr.t('SIDEBAR.ARTISTS'),
        id: 'artistsTab',
        type: 'large_button',
        link: '/artists?view=firetailnoselect'
    },
    {
        icon: 'album',
        name: tr.t('SIDEBAR.ALBUMS'),
        id: 'albumsTab',
        type: 'large_button',
        link: '/albums?view=firetailnoselect'
    },
    {
        icon: 'heart',
        name: tr.t('SIDEBAR.FAVOURITE'),
        id: 'likedTab',
        type: 'large_button',
        link: '/liked'
    },
    //potential future features? :o just trying to see how it could look
    /* {
        name: "External",
        type: 'subtitle'
    },
    {
        icon: 'album',
        name: "CD/DVD",
        id: 'settingsTab',
        type: 'large_button',
        link: '/cd'
    },
    {
        icon: 'album',
        name: "Radio",
        id: 'settingsTab',
        type: 'large_button',
        link: '/radio'
    },
    {
        icon: 'album',
        name: "Podcasts",
        id: 'settingsTab',
        type: 'large_button',
        link: '/podcasts'
    }, */
    {
        name: tr.t('SIDEBAR.PLAYLISTS'),
        type: 'subtitle'
    },
    {
        name: tr.t('SIDEBAR.CREATE_PLAYLIST'),
        id: 'createPlaylist',
        icon: 'add',
        type: 'special_button',
        action() {
            store.commit('panel/invokeNewPanel', {
                component: 'PlaylistModule',
                newProps: {
                    topMsg: tr.t('PANEL.PLAYLIST.TITLE')
                }
            })
        }
    }
    ],
    screenTitle: '',
    screenCountType: tr.tc('TOP_TITLE.COUNT_TYPE_SONGS', 0),
    screenCountNum: 0,
    showScreenTop: true,
    artists: [],
    albums: [],
    currentView: 'all',
    playingView: null,
    favouriteSongs: [],
    scrolled: 0,
    playingBarColour: null,
    ver: 'unknown',
    buildNum: 'unknown',
    port: '0',
    isCDBurnEnable: false,
    albumViewCurrentArt: '',
    fullscreen: false,
    zenMoveMouseActive: false,
    spotifyDetails: {
        name: 'unknown',
        uri: 'unknown'
    },
    isSpotifyConnected: false,
    checkNav: {
        back: false,
        forward: false
    },
    highContrastEnabled: false,
    reduceMotionEnabled: false,
    advancedFileInfo: window.localStorage.getItem('advancedFileInfo') === 'true',
    colourBarEnabled: true,
})

const mutations = {
    updateScreenCountNum(state, num) {
        state.screenCountNum = num
    },
    updateScreenTitle(state, title) {
        state.screenTitle = title
    },
    updateTopVisible(state, show) {
        state.showScreenTop = show
    },
    updateArtists(state, artists) {
        let sortedArtists = sort.sortArray(artists, 'artist')
        state.artists = sortedArtists
    },
    updateAlbums(state, albums) {
        let sortedAlbums = sort.sortArray(albums, 'album')
        state.albums = sortedAlbums
    },
    updateCurrentView(state, view) {
        state.currentView = view
    },
    updatePlayingView(state, view) {
        state.playingView = view
    },
    updateFavouriteSongs(state, ids) {
        state.favouriteSongs = ids
    },
    updateCurrentScroll(state, scrolled) {
        state.scrolled = scrolled
    },
    updatePlayingBarColour(state, colour) {
        state.playingBarColour = colour
    },
    updateVer(state, ver) {
        state.ver = ver
    },
    updateBuildNum(state, buildNum) {
        state.buildNum = buildNum
    },
    updatePort(state, port) {
        state.port = port
    },
    addItemToNav(state, item) {
        state.navs.push(item)
    },
    enableCDBurn(state) {
        state.isCDBurnEnable = true
    },
    updateAlbumViewCurrentArt(state, url) {
        state.albumViewCurrentArt = url
    },
    updateFullscreen(state, isFull) {
        state.fullscreen = isFull
        if (!isFull) {
            state.zenMoveMouseActive = true
        }
    },
    updateZenMouse(state, moved) {
        state.zenMoveMouseActive = moved
    },
    updateSpotifyDetails(state, details) {
        state.spotifyDetails = {
            name: details.name,
            uri: details.uri
        }
    },
    updateSpotifyActive(state, isActive) {
        state.isSpotifyConnected = isActive
    },
    updateCheckNav(state, nav) {
        state.checkNav = nav
    },
    updateAdvancedFileInfo(state, enabled) {
        state.advancedFileInfo = enabled
    },
    updateHighContrast(state, enabled) {
        state.highContrastEnabled = enabled
    },
    updateReduceMotion(state, enabled) {
        state.reduceMotionEnabled = enabled
    },
    updateColourBar(state, enabled) {
        state.colourBarEnabled = enabled
    }
}

const actions = {
    requestColumn(context, type) {
        ipcRenderer.send('getSomeFromColumna', type)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}