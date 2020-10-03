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
        link: `/?name=${encodeURIComponent(tr.t('sidebar.songs'))}`
    },
    {
        icon: 'person',
        name: tr.t('sidebar.artists'),
        id: 'artistsTab',
        type: 'large_button',
        link: '/artists'
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