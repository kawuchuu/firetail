<template>
    <div v-if="item.type == 'subtitle'" class="subtitle">{{item.label}}</div>
    <div v-else-if="item.type == 'button'" v-show="hideCheck" class="button-option">
        <p>{{item.label}}</p>
        <div @click="item.action($root)" class="button">{{item.btnLabel}}</div>
    </div>
    <div v-else-if="item.type == 'switch'" class="switch-option">
        <p>{{item.label}}</p>
        <div class="switch" :class="switchEnabled" @click="switchOnClick">
            <div class="circle-inner" />
        </div>
    </div>
    <p v-else-if="item.type == 'text'" class="text">{{item.message}}</p>
    <About v-else-if="item.type == 'about'"/>
</template>

<script>
import About from './About'

export default {
    props: ['item'],
    components: {
        About
    },
    methods: {
        updateLabel() {
            if (this.item.conditions && this.item.conditions.label) {
                const itemLabel = this.item.conditions.label
                if (itemLabel.type == 'store') {
                    const details = this.$store.state[itemLabel.module][itemLabel.state]
                    this.item.label = itemLabel.baseString.replace('$$FTINSERT$$', details.name)
                }
            }
        },
        switchOnClick() {
            this.item.enabled = !this.item.enabled
            this.item.onClick(this.$root, this.item.enabled)
        }
    },
    computed: {
        hideCheck() {
            if (this.item.conditions && this.item.conditions.show && this.item.conditions.show.type == 'store') {
                const checkItem = this.$store.state[this.item.conditions.show.module][this.item.conditions.show.state]
                return checkItem == this.item.conditions.show.onlyShow
            } else {
                return true
            }
        },
        prepWatch() {
            if (!this.item.conditions || !this.item.conditions.watch) return
            const getModState = this.item.conditions.watch.item.split('/')
            const getStoreItem = this.$store.state[getModState[0]][getModState[1]]
            return getStoreItem
        },
        switchEnabled() {
            if (this.item.enabled) {
                return 'enabled'
            } else return ''
        }
    },
    watch: {
        prepWatch() {
            switch(this.item.conditions.watch.for) {
                case "label": {
                    this.updateLabel()
                    break;
                }
            }
        }
    },
    mounted() {
        this.updateLabel()
    },
}
</script>

<style lang="scss">
.subtitle {
    font-size: 30px;
    font-weight: bold;
    border-bottom: solid 1px #5f587c;
    padding-bottom: 15px;
    margin: 50px 0px 20px;
    letter-spacing: -0.02em;
}

.button-option, .switch-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0px;
    
    p {
        margin: 0;
    }
    .button {
        height: 20px;
        display: flex;
        align-items: center;
        padding: 10px 15px;
        color: var(--hl-txt);
        border-radius: 10px;
        width: auto;
        text-transform: uppercase;
        font-weight: bold;
        cursor: pointer;
    }
    .button span {
        font-weight: bold;
        text-transform: uppercase;
    }
    .button:hover {
        background-color: var(--hl-op)
    }
    .button:active {
        background-color: var(--hl-op);
        opacity: 0.5;
    }

    .switch {
        width: 45px;
        height: 14px;
        background-color: #3d3d3d;
        border-radius: 50px;
        display: flex;
        align-items: center;
        transition-duration: 0.15s;
        transition-property: background-color;
        margin: 20px;
        cursor: pointer;

        .circle-inner {
            width: 24px;
            height: 24px;
            border-radius: 50px;
            transition-duration: 0.15s;
            transition-property: transform, background-color, width;
            transform: translateX(0px);
            background-color: var(--text);
            box-shadow: 0px 1px 5px rgba(0,0,0,.25);
        }
    }

    .switch:active {
        .circle-inner {
            width: 30px;
        }
    }

    .switch.enabled {
        background-color: var(--hl-op);

        .circle-inner {
            background-color: var(--hl-txt);
            transform: translateX(21px);
        }
    }

    .switch.enabled:active {
        .circle-inner {
            transform: translateX(15px);
        }
    }
}

.text {
    margin-top: 10px;
    font-size: 12px;
    color: #7e769c;
}
</style>