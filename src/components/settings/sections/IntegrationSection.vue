<script setup lang="ts">
import SubtitleOption from "../options/SubtitleOption.vue";
import ButtonOption from "../options/ButtonOption.vue";
import SwitchOption from "../options/SwitchOption.vue";
import Modal from "../../Modal.vue";
import {onBeforeMount, ref, watch} from "vue";
import LastFmModal from "../../modals/LastFmModal.vue";
import Dialogue from "../../modals/Dialogue.vue";

const showLastFmModal = ref(false);
const showDisconnectDialogue = ref(false);

const lastFmKeySet = ref(false);
const lastFmPaused = ref(window.ftStoreSync.keyExists("lastFmPaused") ? window.ftStoreSync.getItem("lastFmPaused") : false);


async function disconnectLastFm() {
  await window.ftStore.deleteKey('lastfmSk');
  await window.ftStore.deleteKey('lastfmName');
  lastFmKeySet.value = false;
  showDisconnectDialogue.value = false;
}

watch(showLastFmModal, open => {
  if (!open) lastFmKeySet.value = window.ftStoreSync.keyExists('lastfmSk');
});

function pauseLastFmAction(enabled: boolean) {
  lastFmPaused.value = enabled;
}

onBeforeMount(() => {
  lastFmKeySet.value = window.ftStoreSync.keyExists('lastfmSk');
})
</script>

<template>
  <section class="integrations">
    <SubtitleOption>{{$t('SETTINGS.SUBTITLES.INTEGRATION')}}</SubtitleOption>
    <ButtonOption v-if="!lastFmKeySet" :action="() => showLastFmModal = true" class="lastfm" :label="$t('SETTINGS.LASTFM_INTEGRATION_DISCONNECTED')" :btn-label="$t('SETTINGS.BUTTON.CONNECT_LASTFM')" />
    <ButtonOption v-if="lastFmKeySet" :action="() => showDisconnectDialogue = true" label="Disconnect Last.fm from Firetail" btn-label="Disconnect"></ButtonOption>
    <SwitchOption v-if="lastFmKeySet" :action="pauseLastFmAction" label="Pause scrobbling to Last.fm" store-key="lastfmPause" store-category="lastfm" />
  </section>
  <Modal v-model:open="showLastFmModal" title="Last.fm Integration"><LastFmModal/></Modal>
  <Dialogue title="Disconnect Last.fm" v-model:open="showDisconnectDialogue" :buttons="[{label: 'Cancel', click: () => showDisconnectDialogue = false}, {label: 'Disconnect', click: disconnectLastFm}]">This is a test dialogue.</Dialogue>
</template>

<style scoped lang="scss">

</style>