<template>
    <div v-show="icon !== 'waving_hand'" class="item-add" :class="theClass">
        <i class="material-icons" :class="statusIcon">{{ icon }}</i>
        <div class="add-info">
            <h4>{{ title }}</h4>
            <p v-if="message !== ''">{{ message }}</p>
            <p v-else>{{ progress }} - {{ progPer }}%</p>
        </div>
        <div class="bar-wrapper">
            <div class="bar" :style="barWidth">
                <div v-if="icon === 'queue' && progPer === 100" class="indicate-wrapper">
                    <div class="bar-indicate"></div>
                    <div class="bar-indicate"></div>
                    <div class="bar-indicate"></div>
                    <div class="bar-indicate"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            progress: '0/0',
            progPer: 100,
            theClass: '',
            title: 'Hiiii',
            message: "wahoo",
            icon: 'waving_hand'
        }
    },
    computed: {
        barWidth() {
            return `width: ${this.progPer}%`
        },
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
        }
    },
    mounted() {
        window.ipcRenderer.receive('doneProgress', (event, prog) => {
            this.message = ''
            this.icon = 'autorenew'
            const progP = prog[0] / prog[1] * 100;
            this.progress = `${prog[0]}/${prog[1]}`
            this.progPer = `${Math.round(progP)}`
        })
        window.ipcRenderer.receive('startOrFinish', (event, doingWhat) => {
            if (doingWhat) {
                this.progPer = 100
                this.icon = 'queue'
                this.title = 'Preparing for import...'
                this.message = "Sit tight... we'll start soon!"
                this.theClass = 'shown'
            } else {
                this.title = 'Finished!'
                this.icon = 'done'
                setTimeout(() => this.theClass = '', 3000)
            }
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
    "icon info"
    "bar bar";
    grid-template-columns: 65px 1fr;

    background: var(--bg);
    border: solid var(--bd) 1px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    width: 325px;
    height: 90px;
    border-radius: 10px;

    opacity: 0;
    pointer-events: none;

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

.bar-wrapper {
    grid-area: bar;
    margin: 3px 15px 0px;

    .bar {
        height: 5px;
        width: 100%;
        background: var(--hl-txt);
        border-radius: 10px;
        overflow: hidden;
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

@keyframes movelmao {
    from {
        transform: translate(-170px)
    }
    to {
        transform: translate(0px);
    }
}

.indicate-wrapper {
    display: flex;
    transform: translate(-170px);
    animation: movelmao 1.5s infinite linear;
}

.bar-indicate {
    position: relative;
    min-width: 150px;
    height: 5px;
    background: linear-gradient(to left, transparent, #f5bfbc, transparent);
    margin-right: 20px;
}
</style>