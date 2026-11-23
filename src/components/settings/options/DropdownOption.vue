<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, ref, useId, useTemplateRef, watch} from "vue";
import {useI18n} from "vue-i18n";
import DropdownItem from "../../../types/DropdownItem";

const props = withDefaults(defineProps<{
    label: string,
    initSelected?: DropdownItem,
    options: DropdownItem[],
    onChange?: (item: DropdownItem) => void,
    storeKey?: string,
    storeCategory?: string,
}>(), {
    onChange: () => {},
});

const {t, te} = useI18n();

const root = useTemplateRef<HTMLElement>('root');
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const panel = useTemplateRef<HTMLDivElement>('panel');
const list = useTemplateRef<HTMLUListElement>('list');
const listId = useId();

const selected = ref<DropdownItem | undefined>(props.initSelected);
const open = ref(false);
const highlighted = ref(-1);
const openUp = ref(false);

watch(() => props.initSelected, (value) => {
    selected.value = value;
});

function display(item?: DropdownItem) {
    if (!item) return '';
    return te(item.label) ? t(item.label) : item.label;
}

const selectedIndex = computed(() =>
    props.options.findIndex(o => o.value === selected.value?.value)
);

function optionId(index: number) {
    return `${listId}-opt-${index}`;
}

async function openList() {
    if (open.value || props.options.length === 0) return;
    highlighted.value = Math.max(0, selectedIndex.value);
    open.value = true;
    document.addEventListener('pointerdown', onOutsidePointer, true);
    await nextTick();
    placeList();
    scrollHighlightedIntoView();
}

function closeList(returnFocus = false) {
    if (!open.value) return;
    open.value = false;
    highlighted.value = -1;
    document.removeEventListener('pointerdown', onOutsidePointer, true);
    if (returnFocus) trigger.value?.focus();
}

function toggle() {
    if (open.value) closeList();
    else openList();
}

function onOutsidePointer(e: PointerEvent) {
    if (!root.value?.contains(e.target as Node)) closeList();
}

function placeList() {
    if (!trigger.value || !panel.value) return;
    const rect = trigger.value.getBoundingClientRect();
    const listHeight = panel.value.offsetHeight;
    const bottomLimit = window.innerHeight - 85;
    const spaceBelow = bottomLimit - rect.bottom;
    const spaceAbove = rect.top - 44;
    openUp.value = spaceBelow < listHeight && spaceAbove > spaceBelow;
}

function scrollHighlightedIntoView() {
    if (highlighted.value < 0 || !list.value) return;
    const el = list.value.children[highlighted.value] as HTMLElement | undefined;
    el?.scrollIntoView({block: 'nearest'});
}

function select(item: DropdownItem) {
    const changed = item.value !== selected.value?.value;
    selected.value = item;
    closeList(true);
    if (!changed) return;
    if (props.storeKey) window.ftStore.setKey(props.storeKey, item.value, props.storeCategory);
    props.onChange(item);
}

function moveHighlight(to: number) {
    const count = props.options.length;
    if (count === 0) return;
    highlighted.value = Math.max(0, Math.min(count - 1, to));
    scrollHighlightedIntoView();
}

function onKeydown(e: KeyboardEvent) {
    if (!open.value) {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            openList();
        }
        return;
    }
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            moveHighlight(highlighted.value + 1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            moveHighlight(highlighted.value - 1);
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            if (highlighted.value >= 0) select(props.options[highlighted.value]);
            break;
        case 'Escape':
            e.preventDefault();
            closeList(true);
            break;
        case 'Tab':
            closeList();
            break;
    }
}

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onOutsidePointer, true);
});
</script>

<template>
    <div class="dropdown-option">
        <p>{{ label }}</p>
        <div ref="root" class="dropdown" :class="{open, up: openUp}">
            <button
                ref="trigger"
                type="button"
                class="trigger inner-outline"
                role="combobox"
                aria-haspopup="listbox"
                :aria-expanded="open"
                :aria-controls="listId"
                :aria-label="label"
                :aria-activedescendant="open && highlighted >= 0 ? optionId(highlighted) : undefined"
                @click="toggle"
                @keydown="onKeydown"
            >
                <span class="value">{{ display(selected) }}</span>
                <i class="ft-icon chevron" aria-hidden="true">arrow-head-down</i>
            </button>
            <div v-show="open" ref="panel" class="options-panel inner-outline">
                <ul
                    :id="listId"
                    ref="list"
                    class="options"
                    role="listbox"
                    :aria-label="label"
                    tabindex="-1"
                >
                    <li
                        v-for="(item, index) in options"
                        :id="optionId(index)"
                        :key="item.value"
                        class="option"
                        :class="{highlighted: index === highlighted, selected: index === selectedIndex}"
                        role="option"
                        :aria-selected="index === selectedIndex"
                        @pointerenter="highlighted = index"
                        @click="select(item)"
                    >
                        <span>{{ display(item) }}</span>
                        <span v-if="index === selectedIndex" class="check" aria-hidden="true" />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.dropdown-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 6px 0;

    p {
        margin: 0;
    }
}

.dropdown {
    position: relative;
    min-width: 180px;
    max-width: 260px;
}

.trigger {
    appearance: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    padding: 10px 15px;
    border: none;
    border-radius: 10px;
    background: var(--button);
    color: inherit;
    font: inherit;
    text-align: left;
    position: relative;

    .value {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .chevron {
        font-size: 1.2em;
        flex-shrink: 0;
        transition: transform 0.15s ease;
    }
}

.trigger::after {
    border-radius: 10px;
}

.trigger:focus-visible {
    outline: 2px solid var(--text);
    outline-offset: 2px;
}

.options-panel {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    background: var(--button);
    border-radius: 0 0 10px 10px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, .25);
    overflow: hidden;
    z-index: 60;
}

.options-panel::after {
    border-radius: 0 0 10px 10px;
    z-index: 1;
}

.options {
    margin: 0;
    padding: 4px;
    list-style: none;
    max-height: 260px;
    overflow-y: auto;
}

.option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 11px;
    border-radius: 7px;
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;

    span:first-child {
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.option.highlighted {
    opacity: 1;
    background: var(--bd-op);
}

.option.selected {
    opacity: 1;
    font-weight: 600;
}

.check {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
}

.dropdown.open {
    z-index: 60;

    .trigger {
        border-radius: 10px 10px 0 0;
        box-shadow: 0 6px 12px rgba(0, 0, 0, .25);
    }

    .trigger::after {
        border-radius: 10px 10px 0 0;
    }

    .chevron {
        transform: rotate(180deg);
    }
}

.dropdown.open.up {
    .trigger {
        border-radius: 0 0 10px 10px;
    }

    .trigger::after {
        border-radius: 0 0 10px 10px;
    }

    .options-panel {
        top: auto;
        bottom: 100%;
        border-radius: 10px 10px 0 0;
        box-shadow: 0 -6px 12px rgba(0, 0, 0, .25);
    }

    .options-panel::after {
        border-radius: 10px 10px 0 0;
    }
}

.boldText .option.selected {
    font-weight: bold;
}

.reduceMotion .trigger .chevron {
    transition: none;
}
</style>
