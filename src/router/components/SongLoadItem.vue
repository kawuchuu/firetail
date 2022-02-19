<template>
    <div class="loading-item">
        <div />
        <div />
        <div class="artist-title-album">
            <div class="loady-item" />
            <div class="loady-item" />
            <div class="loady-item" />
            <div class="loady-item" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.loading-item {
    position: relative;
    height: 42px;
    display: grid;
    grid-template-columns: 40px 40px 1fr;
    align-items: center;
    justify-items: center;
    column-gap: 5px;
    border-radius: 5px;
}

@keyframes blink {
    from {
        background: var(--fg-bg);
    }
    to {
        background: #3d3852;
    }
}

.artist-title-album {
    display: grid;
    column-gap: 30px;
    grid-template-columns: 3fr 2fr 2fr 40px;
    align-items: center;
    width: calc(100% - 25px);
    height: 100%;

    .loady-item {
        width: 100%;
        height: 20px;
        background: var(--fg-bg);
        border-radius: 5px;
        //animation: blink 1.5s infinite alternate-reverse ease-in;
    }
}
</style>