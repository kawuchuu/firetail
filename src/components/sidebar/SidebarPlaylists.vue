<script setup lang="ts">
import {onBeforeMount, onMounted, Ref, ref, useTemplateRef} from "vue";
import {Playlist} from "../../types/Common";
import FiretailSong from "../../types/FiretailSong";
import SidebarItem from "./SidebarItem.vue";
import Modal from "../Modal.vue";
import StandardButton from "../StandardButton.vue";
import TextInput from "../TextInput.vue";

const playlists: Ref<Playlist[]> = ref([]);

const playlistModal = useTemplateRef('playlistModal');
const modalPlaylistName = ref('My Playlist');
const modalPlaylistDescription = ref('');

function songDragOver(evt: DragEvent) {
  evt.preventDefault();
  if (evt.dataTransfer) {
    evt.dataTransfer.dropEffect = 'copy';
  }
}

function createOrUpdate() {
  console.log(modalPlaylistName.value, modalPlaylistDescription.value);
  window.playlists.createPlaylist(modalPlaylistName.value, modalPlaylistDescription.value, '');
  playlistModal?.value?.setModalActive(false);
}

function songDragEnd(playlist: Playlist, evt: DragEvent) {
  evt.preventDefault();
  const songs = JSON.parse(evt.dataTransfer?.getData('firetail/song') || '[]') as FiretailSong[];
  console.log(playlist.id);
  window.playlists.addToPlaylist(songs, playlist.id);
}

function getPlaylists() {
  playlists.value = window.playlists.getAllPlaylists();
}

onBeforeMount(() => {
  getPlaylists();
});

onMounted(() => {
  window.playlists.onRefreshPlaylists(getPlaylists);
})
</script>

<template>
  <div class="add-playlist" @click="playlistModal?.setModalActive(true)">
    <i class="ft-icon">add</i>
    <span>{{$t('SIDEBAR.CREATE_PLAYLIST')}}</span>
  </div>
  <Modal title="Create Playlist" ref="playlistModal">
    <div class="playlist-modal">
      <div class="playlist-inner">
        <div class="playlist-image">
          <img draggable="false" src="../../assets/no_album.svg" alt="Playlist Image" />
        </div>
        <div class="playlist-info">
          <span>Title</span>
          <TextInput v-model="modalPlaylistName" placeholder="My Playlist" />
          <span>Description</span>
          <TextInput v-model="modalPlaylistDescription" placeholder="Describe your playlist..." :text-area="true" />
        </div>
      </div>
      <div class="playlist-button">
        <StandardButton appearance="primary" @click="createOrUpdate">Create</StandardButton>
      </div>
    </div>
  </Modal>
  <router-link v-for="item in playlists" :key="item.id" :to="`/playlists/${item.id}`" draggable="true" @dragover="songDragOver" @drop="songDragEnd(item, $event)">
    <div class="playlist-item inner-outline">
      <i class="ft-icon">queue</i>
      <span>{{item.name}}</span>
    </div>
  </router-link>
</template>

<style scoped lang="scss">
.playlist-modal {
  display: grid;
  grid-template-rows: 1fr 40px;
  margin: 0 18px 18px;
  gap: 20px;

  .playlist-inner {
    width: 100%;
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 24px;

    .playlist-image {
      width: 140px;
      height: 140px;
      padding-top: 24px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px;
        background: var(--sub-fg);
      }
    }

    .playlist-info {
      display: flex;
      flex-direction: column;

      span {
        font-size: 14px;
        margin-bottom: 8px;
        margin-left: 15px;
      }

      span:not(:first-child) {
        margin-top: 18px;
      }
    }
  }

  .playlist-button {
    justify-self: end;
    display: flex;
  }
}

.playlist-item, .add-playlist {
  display: flex;
  width: 100%;
  height: 32px;
  align-items: center;
  opacity: 0.75;
  border-radius: 10px;
  background: transparent;
  transition: 0.1s;
  transition-property: background;
  position: relative;

  i {
    margin: 0 12px;
    pointer-events: none;
    font-size: 20px;
  }

  span {
    font-size: 14px;
  }
}

.add-playlist {
  height: 42px;

  i {
    border: solid 2px var(--text);
    border-radius: 18%;
    inset: 0;
  }

  span {
    font-size: 15px;
  }
}

.playlist-item:hover, .add-playlist:hover {
  opacity: 1;
}

.router-link-active .playlist-item {
  background: var(--button);
  opacity: 1;
  font-weight: 600;
}

.playlist-item::after {
  opacity: 0;
}

.router-link-active .playlist-item::after {
  border-radius: 10px;
  opacity: 1;
}
</style>