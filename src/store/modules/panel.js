import store from ".."

const state = () => ({
    currentPanelComponent: 'None',
    currentPanelProps: {
        topMsg: 'Welcome to Firetail',
        msg: "Thank you for trying out Firetail. This is an example prompt, showing how panels will work in the future! This prompt is temporary and will be removed very soon.",
        buttons: [
            {
                label: 'Dismiss',
                onClick() {
                    store.commit('panel/updateActive', false)
                }
            }
        ]
    },
    active: false,
    closing: false,
    preventLoad: []
})

const mutations = {
    updatePanelProps(state, newProps) {
        state.currentPanelProps = newProps
    },
    updateActive(state, newValue) {
        if (!state.closing) {
            state.active = newValue
            if (!newValue) {
                state.closing = true
                setTimeout(() => {
                    state.closing = false
                    store.commit('panel/updatePanelProps', {topMsg: 'Panel Title'})
                }, 300)
            }
        } else {
            state.active = false
        }
    },
    updatePanelComponent(state, component) {
        state.currentPanelComponent = component
    },
    updatePreventLoad(state, name) {
        state.preventLoad.push(name)
    }
}

export default {
    namespaced: true,
    state,
    mutations
}