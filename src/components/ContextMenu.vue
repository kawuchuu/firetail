<template>
    <div class="root" :class="show">
        <div class="bg" @pointerdown="hide"></div>
        <div class="ctx-container" :style="getPosStyle">
            <div class="context-menu" ref="ctxMenu">
                <div class="menu-item" v-for="(item, index) in menuItems" :key="index">
                    <div v-show="doShow(item.hide)" v-if="item.type === 'normal'" @click="doAction(item)" class="button" :class="item.style">{{item.label}}</div>
                    <div v-show="doShow(item.hide)" v-else-if="item.type === 'separator'" class="divider"></div>
                </div>
                <div v-if="menuItems.length == 0" class="menu-item"><span>Nothing to show here ~^0^~</span></div>
            </div>
        </div>
    </div>
</template>
<script>
import { contextMenuBus } from '../renderer.js'
export default {
    data() {
        return {
            isShown: false,
            x: 0,
            y: 0,
            menuItems: [],
        }
    },
    computed: {
        getPosStyle() {
            return `left: ${this.x}px; top: ${this.y}px`
        },
        show() {
            if (this.isShown) {
                return 'shown'
            } else return ''
        }
    },
    methods: {
        getPos() {
            if (this.$refs.ctxMenu) {
                let posX = this.x
                let posY = this.y
                const height = window.innerHeight
                const width = window.innerWidth
                const elHeight = this.$refs.ctxMenu.getBoundingClientRect().height
                const elWidth = this.$refs.ctxMenu.getBoundingClientRect().width
                if (this.x + elWidth > width) {
                    posX = posX - elWidth
                }
                if (this.y + elHeight > height) {
                    posY = posY - elHeight
                }
                this.x = posX
                this.y = posY
            }
        },
        updateItems(items) {
            this.menuItems = items
            this.$nextTick().then(() => {
                this.getPos()
            })
        },
        hide() {
            this.isShown = false
            this.menuItems.splice(0)
        },
        doAction(item) {
            if (item.onClick) {
                item.onClick()
            }
            this.hide()
        },
        doShow(x) {
            let willShow = true
            if (x) {
                x.forEach(f => {
                    if (f) {
                        console.log("YES")
                        willShow = false
                    }
                })
            }
            return willShow
        }
    },
    created() {
        contextMenuBus.$on('updateitems', evt => {
            this.updateItems(evt.items)
            if (evt.position) {
                this.x = evt.position.clientX
                this.y = evt.position.clientY
            }
            if (window.process.platform === 'darwin') {
                //window.contextmenu.popup(evt.items)
                this.isShown = true
            } else {
                this.isShown = true
            }
        })
    },
    destroyed() {
        contextMenuBus.$destroy()
    }
}
</script>

<style scoped>
.root {
    z-index: 20;
    width: 100%;
    height: 100%;
    position: fixed;
    pointer-events: none;
    visibility: hidden;
}
.root.shown {
    visibility: visible;
}
.bg {
    pointer-events: all;
    width: 100%;
    height: 100%;
    position: fixed;
}
.ctx-container {
    z-index: 21;
    position: fixed;
    pointer-events: all;
}
.context-menu {
    width: 100%;
    height: 100%;
    min-width: 175px;
    padding: 6px;
    box-sizing: border-box;
    
    background: var(--sub-fg);
    border: solid 1px var(--bd);
    border-radius: 10px;
    box-shadow: 0px 2px 15px rgba(0,0,0,.45);
    font-size: 14px;
}
html.light .context-menu {
    background: var(--bg);
    box-shadow: 0px 2px 12px rgba(0,0,0,.25);
}
.menu-item span {
    opacity: 0.5;
}
.button {
    padding: 8px 13px;
    cursor: pointer;
    border-radius: 7px;
}
.button.dangerous {
    color: #ff5454;
}
html.light .button.dangerous {
    color: #ff0000;
}
.button:hover {
    background: #ffffff18;
}
.button:active {
    background: #ffffff18;
    opacity: 0.5;
}
.divider {
    width: 100%;
    border-bottom: solid 1px var(--bd);
    margin: 6px 0px;
}
html.light .divider {
    border-color: #00000050;
}
html.light .button:hover {
    background: #00000018;
}
html.light .button:active {
    background: #00000018;
    opacity: 0.5;
}
</style>