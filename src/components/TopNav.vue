<template>
    <div :class="isActive" @click="navigate(nav.nav)" class="nav-button">
        <i class="ft-icon" :class="nav.class">{{nav.icon}}</i>
    </div>
</template>

<script>
export default {
    props: ['nav'],
    methods: {
        navigate(way) {
            this.$router.go(way)
        }
    },
    computed: {
        isActive() {
            const checkNav = this.$store.state.nav.checkNav
            if (!checkNav[this.nav.type]) {
                return 'inactive'
            } else {
                return ''
            }
        }
    }
}
</script>

<style scoped>
.nav-button {
    width: 18px;
    height: 18px;
    background: #000000b3;
    padding: 10px;
    margin-right: 10px;
    border-radius: 50px;
    cursor: pointer;
    backdrop-filter: blur(5px);
    /* border: solid 1px #5f587c; */
    -webkit-app-region: no-drag;
}

.nav-button:hover i {
    opacity: 0.5;
}

.nav-button:active {
    opacity: 0.75;
}

.nav-button:active i {
    opacity: 0.5;
}

.nav-button.inactive {
    opacity: 0.5;
    pointer-events: none;
    backdrop-filter: none;
}

.nav-button i {
    font-size: 22px;
    position: relative;
    bottom: 2px;
}

.littlebitback {
    transform: translate(-1px);
}

.littlebitforward {
    transform: translate(0px);
}
</style>