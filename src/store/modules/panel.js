import { ipcRenderer } from "electron"
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
    },
    showNewPrompt(state, content) {
        let newProps = {
            topMsg: content.title,
            msg: content.message
        }
        if (content.buttons == 'clearLibrary') {
            newProps['buttons'] = [
                {
                    label: 'Cancel',
                    onClick() {
                        store.commit('panel/updateActive', false)
                    }
                },
                {
                    label: 'OK',
                    onClick() {
                        ipcRenderer.send('deleteLibrary')
                        store.commit('panel/updateActive', false)
                    }
                }
            ]
        }
        state.currentPanelProps = newProps
        state.currentPanelComponent = 'Prompt'
        this.commit('panel/updateActive', true)
    }
}

export default {
    namespaced: true,
    state,
    mutations
}