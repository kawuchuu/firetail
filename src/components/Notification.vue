<template>
    <div v-show="icon !== 'waving_hand'" class="item-add" :class="[theClass, mainColour]">
        <i class="material-icons" :class="statusIcon">{{ icon }}</i>
        <div class="add-info">
            <h4>{{ title }}</h4>
            <p v-if="message !== ''">{{ message }}</p>
        </div>
    </div>
</template>

<script>
import {bus} from '@/main'

export default {
    data() {
        return {
            theClass: '',
            title: 'blah blah blah',
            message: "coolswag",
            icon: 'waving_hand',
            niceTimeout: null
        }
    },
    computed: {
        statusIcon() {
            switch(this.icon) {
                case 'autorenew': {
                    return 'rotate'
                }
                case 'queue': {
                    return 'flash'
                }
                case 'done': {
                    return 'green'
                }
                default:
                    return ''
            }
        },
        mainColour() {
            if (this.icon == 'error') return 'error'
            else return ''
        }
    },
    mounted() {
        bus.$on('notifySwag', details => {
            clearTimeout(this.niceTimeout)
            this.title = details.title
            this.message = details.message
            this.icon = details.icon
            this.theClass = 'shown'
            this.niceTimeout = setTimeout(() => {
                this.theClass = ''
            }, 5000)
        }) 
    }
}
</script>

<style lang="scss" scoped>
@keyframes enter {
    from {
        top: -100px;
        opacity: 1;
    }
    to {
        top: 50px;
        opacity: 1;
    }
}

@keyframes leave {
    from {
        top: -100px;
        opacity: 1;
    }
    to {
        top: 50px;
        opacity: 1;
    }
}

.item-add {
    position: fixed;
    top: 50px;
    right: 25px;
    z-index: 12;

    display: grid;
    grid-template-areas:
    "icon info";
    grid-template-columns: 65px 1fr;

    background: var(--bg);
    border: solid var(--bd) 1px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    width: 345px;
    height: auto;
    border-radius: 10px;
    padding: 10px 10px 10px 0px;

    opacity: 0;

    animation: leave 0.3s cubic-bezier(0.17, 0.88, 0.23, 1.15) reverse;
    //animation-delay: 1s;

    i {
        justify-self: center;
        align-self: center;
        grid-area: icon;
    }
}

.item-add.shown {
    animation: enter 0.3s cubic-bezier(0.17, 0.88, 0.23, 1.15);
    opacity: 1;
}

.add-info {
    justify-self: start;
    align-self: center;
    grid-area: info;

    p, h4 {
        margin: 5px 0px;
    }

    h4 {
        letter-spacing: -0.02em;
    }

    p {
        margin-top: 6px;
        font-size: 10pt;
        opacity: 0.55;
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg)
    }
    to {
        transform: rotate(360deg)
    }
}

.rotate {
    animation: rotate 1.25s infinite linear;
}

@keyframes flash {
    from {
        opacity: 1;
    }
    to {
        opacity: 0.35;
    }
}

.flash {
    animation: flash 1.5s infinite linear alternate-reverse;
}

.green {
    color: #4cc967;
}

html.light .green {
    color: #00ac25;
}

.error {
    color: #ff4848;
    border-color: #7a2424;

    .add-info p {
        opacity: 0.85;
    }
}

html.light .error {
    color: #ff0000;
    border-color: #ff0000;
}
</style>