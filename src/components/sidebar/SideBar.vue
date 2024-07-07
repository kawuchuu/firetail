<script setup lang="ts">
import SidebarItem from "./SidebarItem.vue";
import SidebarTitle from "./SidebarTitle.vue";
</script>

<template>
    <div class="side-bar">
        <div class="item-container">
            <SidebarItem to="/home" :icon="'home'" :label="'HOME'"></SidebarItem>
            <SidebarTitle :title="'LIBRARY'"></SidebarTitle>
            <SidebarItem to="/" :icon="'note'" :label="'SONGS'"></SidebarItem>
            <SidebarItem to="/artists" :icon="'person'" :label="'ARTISTS'"></SidebarItem>
            <SidebarItem to="/albums" :icon="'album'" :label="'ALBUMS'"></SidebarItem>
            <SidebarItem to="/genres" :icon="'genre'" :label="'GENRES'"></SidebarItem>
            <SidebarItem to="/likes" :icon="'heart'" :label="'FAVOURITE'"></SidebarItem>
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
    height: calc(100% - 24px);
    padding: 12px 0px 12px 12px;
}
</style>