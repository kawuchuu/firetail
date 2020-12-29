import store from '../../store'

class State {

    get audio() {
        return store.state.audio
    }

    get nav() {
        return store.state.nav
    }

    get panel() {
        return store.state.panel
    }

    commit(xModule, mutator, data) {
        store.commit(`${xModule}/${mutator}`, data)
    }

}

export default State