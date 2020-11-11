<template>
    <div :class="showPanel" class="panel-container">
        <div class="panel">
            <div class="top">
                <div v-if="panelProps.topMsg == 'Error'" class="error">
                    <i class="material-icons-outlined">error_outline</i>
                    <span class="top-msg">Error</span>
                </div>
                <span v-else class="top-msg">{{panelProps.topMsg}}</span>
                <i @click="hidePanel" class="material-icons-outlined">close</i>
            </div>
            <div class="content">
                <component :props="panelProps" :is="newPanelComp"/>
            </div>
        </div>
        <div @click="hidePanel" class="panel-bg"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    computed: {
        ...mapState('panel', {
            newPanelComp: function(state) {
                let getComp = state.currentPanelComponent
                if (state.closing) {
                    this.$store.commit('panel/updateActive', false)
                }
                if (getComp == 'None') {
                    console.log('contains nothing so yeah')
                    return undefined
                }
                let comp
                if (state.preventLoad.indexOf(getComp) != -1) {
                    comp = require('./panel-components/Error').default
                    let newProps = this.panelProps
                    newProps.topMsg = 'Error'
                    this.$store.commit('panel/updatePanelProps', newProps)
                    return comp
                }
                try {
                    comp = require(`./panel-components/${getComp}`).default
                } catch(err) {
                    console.error(err)
                    comp = require('./panel-components/Error').default
                    this.$store.commit('panel/updatePreventLoad', getComp)
                    let newProps = this.panelProps
                    newProps.topMsg = 'Error'
                    this.$store.commit('panel/updatePanelProps', newProps)
                }
                return comp
            },
            panelProps: state => { return state.currentPanelProps },
            showPanel: state => { 
                if (state.active) {
                    return 'show'
                } else {
                    return ''
                }
            }
        })
    },
    methods: {
        hidePanel() {
            this.$store.commit('panel/updateActive', false)
        }
    }
}
</script>

<style scoped>
@keyframes preventClick {
    from {
        pointer-events: all;
    }
    to {
        pointer-events: all;
    }
}

@keyframes showPanel {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes hidePanel {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(0.95);
    }
}

.panel-container {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    z-index: 20;
    top: 0;
    opacity: 0;
    transition: 0.25s;
    transition-property: opacity;
    pointer-events: none;
    animation: preventClick 0.5s;
}

.panel-container.show {
    pointer-events: all;
    opacity: 1;
    animation: preventClick 0.5s;
}

.panel-container .panel {
    animation: hidePanel 0.25s;
}

.panel-container.show .panel {
    animation: showPanel 0.25s;
}

.panel {
    max-width: 600px;
    width: 90%;
    max-height: 80%;
    border-radius: 20px;
    background-color: var(--bg);
    z-index: 21;
    position: fixed;
    border: solid 2px var(--bd);
}

.top {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
}

.top span {
    font-size: 20px;
    font-weight: bold;
}

.error {
    display: flex;
    align-items: center;
    color: #ff3a3a;
}

.error i {
    margin-right: 15px;
}

.top i {
    font-size: 26px;
    cursor: pointer;
}

.top i:hover {
    opacity: 0.55;
}

.top i:active {
    opacity: 0.35;
}

.panel-bg {
    position: fixed;
    z-index: 20;
    background-color: rgba(0,0,0,.7);
    width: 100%;
    height: 100%;
    /* backdrop-filter: blur(10px); */
}

.content {
    width: 100%;
    height: 100%;
    transition: 0.25s;
    transition-property: height;
}
</style>