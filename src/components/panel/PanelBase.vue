<template>
    <div :class="showPanel" class="panel-container">
        <div class="panel">
            <div class="top">
                <div v-if="panelProps.topMsg == 'Error'" class="error">
                    <i class="material-icons-outlined">error_outline</i>
                    <span class="top-msg">Error</span>
                </div>
                <span v-else class="top-msg">{{panelProps.topMsg}}</span>
                <i @click="hidePanel" class="ft-icon">close</i>
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
                    comp = require('./panel-components/ModuleError.vue').default
                    let newProps = this.panelProps
                    newProps.topMsg = 'Error'
                    this.$store.commit('panel/updatePanelProps', newProps)
                    return comp
                }
                try {
                    comp = require(`./panel-components/${getComp}`).default
                } catch(err) {
                    console.error(err)
                    comp = require('./panel-components/ModuleError.vue').default
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
        },
        escHide(evt) {
            console.log(evt)
        }
    }
}
</script>

<style lang="scss" scoped>
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
    transition-property: opacity, backdrop-filter;
    pointer-events: none;
    animation: preventClick 0.5s;
    backdrop-filter: blur(10px) saturate(1.5);

    .panel-bg {
        opacity: 0;
    }
}

.panel-container.show {
    pointer-events: all;
    opacity: 1;
    animation: preventClick 0.5s;
    backdrop-filter: blur(10px) saturate(1.5);

    .panel, .panel-bg {
        opacity: 1;
    }
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
    border-radius: 10px;
    background-color: var(--bg);
    z-index: 21;
    position: fixed;
    border: solid 1px var(--bd);
    opacity: 0;
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
    font-weight: 600;
    letter-spacing: -0.02em;
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
    background-color: rgba(0,0,0,.6);
    background-image: url('../../assets/noise.svg');
    background-size: 25%;
    width: 100%;
    height: 100%;
    transition-duration: 0.25s;
    transition-property: opacity;
}

html.light .panel-bg {
    background-color :rgba(0,0,0,.4)
}

.content {
    width: 100%;
    height: 100%;
    transition: 0.25s;
    transition-property: height;
}

.reduce-motion {
    @keyframes showPanelReduce {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes hidePanelReduce {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    .panel-container .panel {
        animation: hidePanelReduce 0.25s;
    }

    .panel-container.show .panel {
        animation: showPanelReduce 0.25s;
    }
}

.performance {
    .panel-container, .panel-container.show {
        backdrop-filter: none;
    }
}

.performance.dark .panel-bg {
    background-color: rgba(0,0,0,.85);
}
</style>