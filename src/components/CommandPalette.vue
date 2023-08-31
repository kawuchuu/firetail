<template>
    <div class="command-palette-wrapper">
        <div class="command-palette">
            <input type="text" placeholder="Start typing away..." />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.command-palette-wrapper {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 21;
    display: none;
    justify-content: center;
    align-items: center;
    pointer-events: none;
}

.command-palette {
    width: 700px;
    height: 60px;
    pointer-events: all;
    transform: translateY(-85px);
    display: flex;
    align-items: center;

    background-color: var(--bg);
    border: solid 1px var(--bd);
    border-radius: 10px;
    box-shadow: 0px 2px 15px rgba(0,0,0,.45);

    input[type="text"] {
        width: 100%;
        padding: 10px 15px;

        background: none;
        border: none;
        outline: none;

        font-family: inherit;
        font-size: 1em;
    }
}
</style>