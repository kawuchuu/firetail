import { ipcRenderer } from 'electron'
import sort from '../../modules/sort'
import tr from '../../translation'

const state = () => ({
    navs: [{
        icon: 'home',
        name: tr.t('sidebar.home'),
        id: 'homeTab',
        type: 'large_button',
        link: '/home'
    },
    {
        icon: 'settings',
        name: tr.t('sidebar.settings'),
        id: 'settingsTab',
        type: 'large_button',
        link: '/settings'
    },
    {
        name: tr.t('sidebar.library'),
        type: 'subtitle'
    },
    {
        icon: 'favorite_border',
        name: tr.t('sidebar.favourite'),
        id: 'likedTab',
        type: 'large_button',
        link: '/liked'
    },
    {
        icon: 'music_note',
        name: tr.t('sidebar.songs'),
        id: 'songsTab',
        type: 'large_button',
        link: `/?name=${encodeURIComponent(tr.t('sidebar.songs'))}&view=all`
    },
    {
        icon: 'person',
        name: tr.t('sidebar.artists'),
        id: 'artistsTab',
        type: 'large_button',
        link: '/artists?hideTop=true&view=artist_firetailnoselect'
    },
    {
        icon: 'album',
        name: tr.t('sidebar.albums'),
        id: 'albumsTab',
        type: 'large_button',
        link: '/albums'
    },
    {
        name: tr.t('sidebar.playlists'),
        type: 'subtitle'
    }
    ],
    screenTitle: '',
    screenCountType: tr.tc('topTitle.countTypeSongs', 0),
    screenCountNum: 0,
    showScreenTop: true,
    artists: [],
    currentView: 'all',
    playingView: null,
    favouriteSongs: [],
    scrolled: 0,
    playingBarColour: null
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