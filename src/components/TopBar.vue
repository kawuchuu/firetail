<template>
    <div class="top-bar">
        <div class="inner">
            <div class="nav-hist-buttons">
                <TopNav v-for="item in nav" :key="item.type" :nav="item"/>
            </div>
            <div class="nav-top-buttons">
                <div class="search-btn">
                    <i class="material-icons">search</i>
                    <input type="text" placeholder="Search...">
                </div>
                <div class="top-button-container">
                    <TopButtons v-for="item in button" v-bind:button="item" v-bind:key="item.id"></TopButtons>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TopButtons from './TopButtons'
import TopNav from './TopNav'
import tr from '../translation'

export default {
    components: {
        TopButtons,
        TopNav
    },
    data() {
        return {
            button: [
                {name: tr.t('topBar.addSongs'), id: 'addFiles', for: 'addFiles', icon: 'add'},
            ],
            nav: [
                {type: 'back', class: 'littlebitback', nav: -1, icon: 'arrow_back_ios'},
                {type: 'forward', class: 'littlebitforward', nav: 1, icon: 'arrow_forward_ios'}
            ]
        }
    }
}
</script>

<style lang="scss" scoped>
.top-bar {
    width: calc(100% - 225px);
    height: 50px;
    background: transparent;
    position: fixed;
    z-index: 10;
    top: 0;
    pointer-events: none;
}

.top-bar .inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 20px;
}

.top-button-container {
    display: flex;
    background: #000000b3;
    padding: 10px 20px;
    border-radius: 40px;
    pointer-events: all;
    backdrop-filter: blur(5px);
    border: solid 1px #5f587c;
}

.nav-hist-buttons {
    display: flex;
    align-items: center;
    margin-left: 10px;
    pointer-events: all;
}

.nav-top-buttons {
    display: flex;
    align-items: center;
}

.search-btn {
    background: #000000b3;
    padding: 10px;
    border-radius: 40px;
    height: 18px;
    width: 18px;
    margin-right: 10px;
    backdrop-filter: blur(5px);
    pointer-events: all;
    cursor: pointer;
    border: solid 1px #5f587c;

    display: flex;
    align-items: center;
    justify-content: space-between;

    -webkit-app-region: no-drag;
    
    i {
        font-size: 22px;
        transform: translate(-1px);
    }

    input[type=text] {
        width: 165px;
        background: transparent;
        border: none;
        outline: none;
        height: 15px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: white;

        display: none;
    }
}

.search-btn.active {
    width: 200px;
    cursor: default;

    input {
        display: block;
    }
}

.search-btn:hover i {
    opacity: 0.5;
}

.search-btn.active:hover i {
    opacity: 1;
}

.search-btn:active {
    opacity: 0.75;
}

.search-btn.active:active {
    opacity: 1;
}

.search-btn:active i {
    opacity: 0.5;
}

.search-btn.active:active i {
    opacity: 1;
}
</style>