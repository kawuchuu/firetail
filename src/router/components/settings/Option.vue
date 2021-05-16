<template>
    <div v-if="item.type == 'subtitle'" class="subtitle">{{item.label}}</div>
    <div v-else-if="item.type == 'button'" v-show="hideCheck" class="button-option">
        <p>{{item.label}}</p>
        <div @click="item.action($root)" class="button">{{item.btnLabel}}</div>
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
    border-bottom: solid 1px var(--text);
    padding-bottom: 15px;
    margin: 50px 0px 20px;
    letter-spacing: -0.02em;
}

.button-option {
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
}

.text {
    margin-top: 10px;
    opacity: 0.5;
    font-size: 13px;
}
</style>