<template>
    <div class="root">
        <div class="top-title" :style="show">
            <div class="tab-album-art"></div>
            <div>
                <h1>{{ screenTitle }}</h1>
                <p>{{ screenCountNum }} {{ screenCountType }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: mapState('nav', {
        screenTitle: state => state.screenTitle,
        screenCountType: state => state.screenCountType,
        screenCountNum: state => state.screenCountNum,
        show: state => {
            if (state.showScreenTop) {
                return 'display: flex'
            } else {
                return 'display: none'
            }
        }
    })
}
</script>

<style scoped>
.root {
    background-color: #000000;
}

.top-title {
    padding: 35px 45px;
    display: flex;
    align-items: center;
    background: linear-gradient(#e74e8e, #e74e8ea6)
}

.top-title h1 {
    font-size: 64px;
    margin: 0;
    letter-spacing: -2px;
}

.top-title i {
    font-size: 36px;
    display: none;
    margin-right: 40px;
}

.top-title p {
    margin: 0px;
    margin-top: 5px;
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