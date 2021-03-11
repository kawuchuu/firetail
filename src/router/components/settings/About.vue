<template>
    <div class="about">
        <img draggable="false" src="@/assets/firetail.svg">
        <div class="info">
            <div>
                <h1>Firetail</h1>
                <p>Version {{version}}</p>
                <p>Copyright &copy; 2021 kawuchuu</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            version: this.$store.state.nav.ver
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
}
p {
    margin: 10px 0px;
    opacity: 0.75;
}
</style>