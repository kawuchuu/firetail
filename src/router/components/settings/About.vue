<template>
    <div class="about">
        <img draggable="false" src="@/assets/firetail.svg">
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
    width: 100px;
    height: auto;
    margin-right: 35px;
}
.about {
    display: flex;
}
h1 {
    margin: 10px 0px;
    letter-spacing: -0.02em;
}
p {
    margin: 10px 0px;
    opacity: 0.75;
}
</style>