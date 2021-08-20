const state = () => ({
    playlists: []
})

const mutations = {
    setPlaylists(state, playlists) {
        state.playlists = playlists
    }
}

export default {
    namespaced: true,
    state,
    mutations,
}