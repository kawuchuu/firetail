<template>
    <div class="popup search" :class="active">
        <div class="search-inner">
            <span>Search will go here</span>
        </div>
    </div>
</template>

<script>
export default {
    props: ['active']
}
</script>

<style lang="scss" scoped>
.popup {
    position: fixed;
    width: auto;
    height: 300px;
    background: var(--back-bg);
    border-radius: 5px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    pointer-events: none;
    opacity: 0;
    //transition: .15s;
    border: solid 1px var(--bd);
    transition: 0.2s cubic-bezier(0.17, 0.88, 0.25, 1.1);
    transition-property: transform opacity;
    z-index: 2;
    right: 0px;
}

.popup::before {
    content: "";
    width: 20px;
    height: 20px;
    transform: rotate(-45deg);
    background: var(--back-bg);
    position: absolute;
    top: -8px;
    right: 18px;
    border: solid 1px var(--bd);
    border-radius: 2px;
    box-shadow: 0px 5px 10px rgba(0,0,0,.15);
    z-index: 1;
}

.popup.active {
    opacity: 1;
    transform: translate(-55px, 20px) scale(1) !important;
    pointer-events: all;
}

.popup.search {
    transform: translate(0px, -300px) scale(0);
    width: 350px;
    height: 500px;

    .search-inner {
        width: 100%;
        height: 100%;
        background: var(--back-bg);
        border-radius: 20px;
        position: relative;
        z-index: 2;
    }
}

.reduce-motion {
    .popup.search {
        transform: translate(-160px, -315px);
    }
}
</style>