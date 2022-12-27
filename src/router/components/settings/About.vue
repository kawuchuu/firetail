<template>
    <div class="about">
        <img draggable="false" src="@/assets/firetail.png">
        <div class="info">
            <div>
                <h1>Firetail</h1>
                <p>Version {{version}}<span v-show="checkBuild"> [{{build}}]</span>, {{ arch }}</p>
                <p>Copyright &copy; 2022 kawuchuu</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            version: this.$store.state.nav.ver,
            build: this.$store.state.nav.buildNum,
            arch: process.arch
        }
    },
    computed: {
        checkBuild() {
            if (this.build === 'unknown' || this.build === 'CUSTOM') return false
            else return true
        }
    }
}
</script>

<style lang="scss" scoped>
img {
    width: 108px;
    height: 108px;
    margin-right: 35px;
    aspect-ratio: 1 / 1;
}
.about {
    display: flex;
    align-items: center;
}
h1 {
    margin: 10px 0px;
    letter-spacing: -0.02em;
}

.darwin h1 {
    letter-spacing: -0.01em;
}

p {
    margin: 10px 0px;
    opacity: 0.75;
}
</style>