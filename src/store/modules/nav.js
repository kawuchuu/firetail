import i18n from '../../translation'
const state = () => ({
    navs: [{
        icon: 'home',
        name: i18n.t('home'),
        id: 'homeTab',
        type: 'large_button',
        link: '/home'
    },
    {
        icon: 'settings',
        name: 'Settings',
        id: 'settingsTab',
        type: 'large_button',
        link: '/settings'
    },
    {
        name: 'Library',
        type: 'subtitle'
    },
    {
        icon: 'favorite_border',
        name: 'Liked Songs',
        id: 'likedTab',
        type: 'large_button',
        link: '/liked'
    },
    {
        icon: 'music_note',
        name: 'All Songs',
        id: 'songsTab',
        type: 'large_button',
        link: '/?name=All%20Songs'
    },
    {
        icon: 'person',
        name: 'Artists',
        id: 'artistsTab',
        type: 'large_button',
        link: '/artists'
    },
    {
        icon: 'album',
        name: 'Albums',
        id: 'albumsTab',
        type: 'large_button',
        link: '/albums'
    },
    {
        name: 'Playlists',
        type: 'subtitle'
    }
    ],
    screenTitle: 'All Songs',
    screenCountType: 'songs',
    screenCountNum: 0
})

const mutations = {
    updateScreenCountNum(state, num) {
        state.screenCountNum = num
    },
    updateScreenTitle(state, title) {
        state.screenTitle = title
    }
}

export default {
    namespaced: true,
    state,
    mutations
}