<template>
    <div class="centre">
        <img class="logo" src="../../assets/logo-mono.svg" />
        <p>It's a little quiet here...</p>
    </div>
</template>

<style lang="scss" scoped>
.centre {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.logo {
    width: 200px;
    height: 200px;
    filter: brightness(10);
    opacity: 0.1;
}

p {
    font-size: 0.8em;
    opacity: 0.15;
    margin-top: 0px;
}
</style>