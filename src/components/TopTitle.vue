<template>
    <div class="top-title">
        <i class="material-icons-outlined" id="tabBackButton" style="cursor: pointer"
            v-on:click="backBtn">arrow_back</i>
        <div class="tab-album-art"></div>
        <div>
            <h1>{{ screenTitle }}</h1>
            <p>{{ screenCountNum }} {{ screenCountType }}</p>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState('nav', {
        screenTitle: state => state.screenTitle,
        screenCountType: state => state.screenCountType,
        screenCountNum: state => state.screenCountNum
    })
}
</script>

<style scoped>
.top-title {
    padding: 35px 45px;
    display: flex;
    align-items: center;
}

.top-title h1 {
    font-size: 36px;
    margin: 0;
}

.top-title i {
    font-size: 36px;
    display: none;
    margin-right: 40px;
}

.top-title p {
    margin: 0px;
    margin-top: 10px;
    opacity: .75;
}

.tab-album-art {
    margin-right: 40px;
    height: 125px;
    width: 125px;
    background-color: var(--fg-bg);
    background-image: url('../assets/no_album.svg');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 10px;
    display: none;
}
</style>