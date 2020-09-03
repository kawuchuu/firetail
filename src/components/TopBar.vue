<template>
    <div class="top-bar">
        <div class="inner">
            <div class="app-info">
                <i class="material-icons-outlined">menu</i>
                <div class="firetail-icon"/>
                <div class="app-name">Firetail</div>
                <div class="beta-tag">Beta</div>
            </div>
            <div class="nav-top-buttons">
                <div class="top-button-container">
                    <TopButtons v-for="item in button" v-bind:button="item" v-bind:key="item.id"></TopButtons>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import TopButtons from './TopButtons'

export default {
    components: {
        TopButtons
    },
    data() {
        return {
            button: [
                {name: 'Add Songs', id: 'addFiles', for: 'addFiles', icon: 'add'}
            ]
        }
    }
}
</script>

<style scoped>
.top-bar {
    width: 100%;
    height: 50px;
    background: var(--fg-bg);
    border-bottom: var(--bd) 2px solid;
    box-shadow: 0px 1px 5px rgba(0,0,0,.15);
    position: fixed;
    z-index: 10;
    top: 0;
}

.top-bar .inner {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0px 15px;
}

.firetail-icon {
    width: 35px;
    height: 35px;
    background-image: url('../assets/firetail-menu.svg');
    background-size: cover;
    margin: 0 7px 0 10px;
    transform: translateY(-2px);
    filter: brightness(var(--logo));
}

.app-info {
    display: flex;
    align-items: center;
}

.app-name {
    font-family: 'Inter';
    font-weight: bold;
    font-size: 18px;
}

.beta-tag {
    font-size: 10px;
    padding: 3px 4px;
    border: solid 2px var(--text);
    color: var(--text);
    opacity: .75;
    border-radius: 20px;
    margin: 0px 10px 0px 10px;
    position: relative;
    top: 1px;
    font-weight: bold;
    text-transform: uppercase
}
</style>