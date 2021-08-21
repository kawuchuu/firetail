const state = () => ({
    playlists: [],
    currentPlaylist: {
        name: 'Unknown',
        desc: 'Unknown',
        id: 'Unknown',
        songIds: []
    }
})

const mutations = {
    setPlaylists(state, playlists) {
        state.playlists = playlists
    },
    setCurrentPlaylist(state, playlist) {
        state.currentPlaylist = playlist
    }
}

export default {
    namespaced: true,
    state,
    mutations,
}