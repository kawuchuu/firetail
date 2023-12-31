import store from ".."
import tr from '../../translation'

const state = () => ({
    currentPanelComponent: 'None',
    currentPanelProps: {
        topMsg: '',
        msg: "",
        buttons: []
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
                    state.currentPanelComponent = 'None'
                    this.commit('panel/updatePanelProps', {})
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
    invokeNewPanel(state, props) {
        state.currentPanelProps = props.newProps
        state.currentPanelComponent = props.component
        this.commit('panel/updateActive', true)
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
                        window.ipcRenderer.send('deleteLibrary')
                        store.commit('panel/updateActive', false)
                    }
                }
            ]
        }
        if (content.buttons === 'dismiss') {
            newProps['buttons'] = [
                {
                    label: tr.t('BUTTONS.OK'),
                    onClick() {
                        store.commit('panel/updateActive', false)
                    }
                }
            ]
        }
        if (content.buttons == 'spotifyLogout') {
            newProps['buttons'] = [
                {
                    label: 'Cancel',
                    onClick() {
                        store.commit('panel/updateActive', false)
                    }
                },
                {
                    label: 'Log Out',
                    onClick() {
                        localStorage.removeItem('sp-token')
                        localStorage.removeItem('sp-name')
                        localStorage.removeItem('sp-uri')
                        store.commit('nav/updateSpotifyActive', false)
                        store.commit('panel/updateActive', false)
                    }
                }
            ]
        }
        state.currentPanelProps = newProps
        state.currentPanelComponent = 'PromptModule.vue'
        this.commit('panel/updateActive', true)
    }
}

export default {
    namespaced: true,
    state,
    mutations
}