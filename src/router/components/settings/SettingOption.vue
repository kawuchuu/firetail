<template>
    <div v-if="option.type == 'subtitle'" class="subtitle">{{option.label}}</div>
    <div v-else-if="option.type == 'button'" v-show="hideCheck" class="button-option">
        <p>{{option.label}}</p>
        <div @click="option.action($root)" class="button" role="button" tabindex="0" :aria-label="`${option.label}. ${option.btnLabel}`">{{option.btnLabel}}</div>
    </div>
    <div v-else-if="option.type == 'switch'" class="switch-option">
        <p>{{option.label}}</p>
        <div class="switch" :class="switchEnabled" @click="switchOnClick">
            <div class="circle-inner" />
        </div>
    </div>
    <div v-else-if="option.type == 'dropdown'" class="dropdown-option">
        <p>{{option.label}}</p>
        <div class="dropdown" @click="dropdownClick" :class="showOptions" role="combobox" aria-disabled="false" aria-selected="false" :aria-label="`${option.label}. ${option.option} selected`" tabindex=0>
            <div class="default-option" aria-hidden="true">
                <span>{{option.option}}</span>
                <i class="ft-icon">{{dropdownEnabled ? 'arrow-head-up' : 'arrow-head-down'}}</i>
            </div>
            <div class="options">
                <option v-for="item in option.options" :key="item" @click="optionClick(item)">{{ item }}</option>
            </div>
        </div>
    </div>
    <p v-else-if="option.type == 'text'" class="text">{{option.message}}</p>
    <About v-else-if="option.type == 'about'"/>
</template>

<script>
import About from './AboutSection.vue'

export default {
    props: ['option'],
    components: {
        About
    },
    data() {
        return {
            dropdownEnabled: false
        }
    },
    methods: {
        updateLabel() {
            if (this.option.conditions && this.option.conditions.label) {
                const optionLabel = this.option.conditions.label
                if (optionLabel.type == 'store') {
                    const details = this.$store.state[optionLabel.module][optionLabel.state]
                    this.option.label = optionLabel.baseString.replace('$$FTINSERT$$', details.name)
                }
            }
        },
        updateSwitch() {
            const optionEnabled = this.option.conditions.enabled
            this.option.enabled = this.$store.state[optionEnabled.module][optionEnabled.state]
        },
        switchOnClick() {
            this.option.enabled = !this.option.enabled
            this.option.onClick(this.$root, this.option.enabled)
        },
        dropdownClick() {
            this.dropdownEnabled = !this.dropdownEnabled
        },
        optionClick(item) {
            this.option.option = item
            this.option.onChange(this.$root, item)
        }
    },
    computed: {
        hideCheck() {
            if (this.option.conditions && this.option.conditions.show && this.option.conditions.show.type == 'store') {
                const checkoption = this.$store.state[this.option.conditions.show.module][this.option.conditions.show.state]
                return checkoption == this.option.conditions.show.onlyShow
            } else {
                return true
            }
        },
        prepWatch() {
            if (!this.option.conditions || !this.option.conditions.watch) return
            const getModState = this.option.conditions.watch.item.split('/')
            const getStoreoption = this.$store.state[getModState[0]][getModState[1]]
            return getStoreoption
        },
        switchEnabled() {
            if (this.option.enabled) {
                return 'enabled'
            } else return ''
        },
        showOptions() {
            if (this.dropdownEnabled) return 'active'
            else return ''
        }
    },
    watch: {
        prepWatch() {
            switch(this.option.conditions.watch.for) {
                case "label": {
                    this.updateLabel()
                    break;
                }
                case "enabled": {
                    this.updateSwitch()
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
    font-size: 1.45em;
    font-weight: 600;
    border-bottom: solid 1px var(--bd);
    padding-bottom: 10px;
    margin: 24px 0px 12px;
    letter-spacing: -0.02em;
}

.darwin .subtitle {
    letter-spacing: -0.01em;
}

.button-option, .switch-option, .dropdown-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0px;
    
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
        //text-transform: uppercase;
        font-weight: 600;
        cursor: pointer;
    }
    .button span {
        font-weight: 600;
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
        background-color: var(--text-op);
        border-radius: 50px;
        display: flex;
        align-items: center;
        transition-duration: 0.15s;
        transition-property: background-color;
        margin: 13px;
        margin-right: 0px;
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

    .dropdown {
        width: 150px;
        background: var(--fg-bg);
        border-radius: 10px;
        position: relative;
        z-index: 2;
        cursor: pointer;

        .default-option {
            display: flex;
            align-items: center;
            justify-content: space-between;

            i {
                font-size: 1.2em;
            }
        }

        option, .default-option {
            padding: 10px 15px;
            text-transform: capitalize;
        }

        .options {
            display: none;
            position: absolute;
            background: var(--fg-bg);
            width: 150px;
            border-radius: 0px 0px 10px 10px;
            z-index: 3;
            
            option {
                opacity: 0.65;
            }

            option:hover {
                opacity: 1;
            }
        }
    }

    .dropdown.active {
        border-radius: 10px 10px 0px 0px;
        box-shadow: 0px 4px 4px rgba(0,0,0,.2);
        position: relative;
        z-index: 55;

        .options {
            display: block;
            box-shadow: 0px 4px 4px rgba(0,0,0,.2);
        }
    }
}

.reduce-motion {
    .switch, .switch .circle-inner {
        transition-duration: 0s;
    }
}

.text {
    margin-top: 10px;
    font-size: 12px;
    opacity: 0.5;
}

.bold-text .subtitle, .bold-text .button {
    font-weight: 800;
}

.rtl {
    .switch.enabled {
        .circle-inner {
            transform: translateX(-21px);
        }
    }
    .switch.enabled:active {
        .circle-inner {
            transform: translateX(-15px);
        }
    }
}
</style>