<script setup lang="ts">
import SidebarItem from "./SidebarItem.vue";
import SidebarTitle from "./SidebarTitle.vue";
</script>

<template>
    <div class="side-bar">
        <div class="item-container">
            <SidebarItem :icon="'home'" :label="'HOME'"></SidebarItem>
            <SidebarTitle :title="'LIBRARY'"></SidebarTitle>
            <SidebarItem :icon="'note'" :label="'SONGS'"></SidebarItem>
            <SidebarItem :icon="'person'" :label="'ARTISTS'"></SidebarItem>
            <SidebarItem :icon="'album'" :label="'ALBUMS'"></SidebarItem>
            <SidebarItem :icon="'genre'" :label="'GENRES'"></SidebarItem>
            <SidebarItem :icon="'heart'" :label="'FAVOURITE'"></SidebarItem>
            <SidebarTitle :title="'PLAYLISTS'"></SidebarTitle>
        </div>
    </div>
</template>

<style scoped>
.side-bar {
    width: var(--sidebar-width);
    height: calc(100vh - 86px);
    z-index: 2;
}

.item-container {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100%;
    padding: 12px 0px 12px 12px;
}
</style>