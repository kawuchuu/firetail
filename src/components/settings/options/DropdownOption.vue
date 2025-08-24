<script>
export default {
    name: "DropdownOption",
    props: {
        label: String,
        initSelected: Object,
        options: Array,
        onChange: {
            default: () => {},
            type: Function
        },
        storeKey: {
            optional: true,
            type: String
        },
        storeCategory: {
            optional: true,
            type: String
        }
    },
    data() {
        return {
            selected: this.initSelected,
            enabled: false
        }
    },
    methods: {
        select(item) {
            this.selected = item
            if (this.storeKey) window.ftStore.setKey(this.storeKey, item.value, this.storeCategory)
            this.onChange(item)
        }
    },
    watch: {
        initSelected() {
            this.selected = this.initSelected;
        }
    }
}
</script>

<template>
    <div class="dropdown-option">
        <p>{{label}}</p>
        <div class="dropdown" @click="enabled = !enabled" :class="enabled ? 'active' : ''" role="combobox" aria-disabled="false" aria-selected="false" :aria-label="`${label}. ${selected} selected`" tabindex=0>
            <div class="default-option" aria-hidden="true">
                <span>{{$t(selected.label)}}</span>
                <i class="ft-icon">{{enabled ? 'arrow-head-up' : 'arrow-head-down'}}</i>
            </div>
            <div class="options">
                <div class="option" v-for="item in options" :key="item.value" @click="select(item)">{{ $t(item.label) }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.dropdown-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0px;

    p {
        margin: 0;
    }
}

.dropdown {
    width: 150px;
    background: var(--fg-bg);
    box-shadow: inset 0 0 0 1px var(--bd-op);
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

    .option, .default-option {
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

        .option {
            opacity: 0.65;
        }

        .option:hover {
            opacity: 1;
        }
    }
}

.dropdown.active {
    border-radius: 10px 10px 0px 0px;
    box-shadow: 0px 4px 4px rgba(0,0,0,.2), inset 0 0 0 1px var(--bd-op);
    position: relative;
    z-index: 55;

    .options {
        display: block;
        box-shadow: 0px 4px 4px rgba(0,0,0,.2);
    }
}
</style>