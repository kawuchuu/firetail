import sort from '../../modules/sort.js'
import tr from '../../translation'
import store from '..'

const state = () => ({
    navs: [
        // I think I'll leave the home tab for Firetail 2.0
/*    {
        icon: 'home',
        name: 'SIDEBAR.HOME',
        id: 'homeTab',
        type: 'large_button',
        link: '/home'
    },*/
/*     {
        icon: 'settings',
        name: tr.t('SIDEBAR.SETTINGS'),
        id: 'settingsTab',
        type: 'large_button',
        link: '/settings'
    }, */
    {
        name: 'SIDEBAR.LIBRARY',
        type: 'subtitle'
    },
    {
        icon: 'note',
        name: 'SIDEBAR.SONGS',
        id: 'songsTab',
        type: 'large_button',
        link: `/songs?view=all`
    },
    {
        icon: 'person',
        name: 'SIDEBAR.ARTISTS',
        id: 'artistsTab',
        type: 'large_button',
        link: '/artists?view=firetailnoselect'
    },
    {
        icon: 'album',
        name: 'SIDEBAR.ALBUMS',
        id: 'albumsTab',
        type: 'large_button',
        link: '/albums?view=firetailnoselect'
    },
        // This will be left for Firetail 2.0.
    /*{
        icon: 'genre',
        name: 'SIDEBAR.GENRES',
        id: 'genresTab',
        type: 'large_button',
        link: '/genres?view=firetailnoselect'
    },*/
    {
        icon: 'heart',
        name: 'SIDEBAR.FAVOURITE',
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
        name: 'SIDEBAR.PLAYLISTS',
        type: 'subtitle'
    },
    {
        name: 'SIDEBAR.CREATE_PLAYLIST',
        id: 'createPlaylist',
        icon: 'add',
        type: 'special_button',
        action() {
            store.commit('panel/invokeNewPanel', {
                component: 'PlaylistModule.vue',
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
    genres: [],
    currentView: 'all',
    playingView: null,
    favouriteSongs: [],
    scrolled: 0,
    playingBarColour: null,
    ver: 'unknown',
    year: '2024',
    buildNum: 'unknown',
    port: '0',
    albumViewCurrentArt: '',
    fullscreen: false,
    zenMoveMouseActive: true,
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
    rtl: false,
    debugMode: false,
    tourMode: false
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
    updateGenres(state, genres) {
        const sortedGenres = sort.sortArray(genres, 'value')
        state.genres = sortedGenres
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
    },
    updateRTL(state, enabled) {
        state.rtl = enabled
    },
    debugMode(state, enabled) {
        state.debugMode = enabled
    },
    updateTourMode(state, enabled) {
        state.tourMode = enabled
    }
}

const actions = {
    requestColumn(context, type) {
        window.ipcRenderer.send('getSomeFromColumna', type)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}