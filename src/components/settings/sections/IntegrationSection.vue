<script setup lang="ts">
import SubtitleOption from "../options/SubtitleOption.vue";
import ButtonOption from "../options/ButtonOption.vue";
import SwitchOption from "../options/SwitchOption.vue";
import Modal from "../../Modal.vue";
import {onBeforeMount, ref, useTemplateRef} from "vue";
import LastFmModal from "../../modals/LastFmModal.vue";
import Dialogue from "../../modals/Dialogue.vue";

const lastfmModal = useTemplateRef('lastfmModal');
const testDialogue = useTemplateRef('testDialogue');

const lastFmKeySet = ref(false);
const lastFmPaused = ref(window.ftStoreSync.keyExists("lastFmPaused") ? window.ftStoreSync.getItem("lastFmPaused") : false);

function openLastFmModal() {
  lastfmModal?.value.setModalActive(true)
}

function openLastFmDisconnectDialogue() {
  testDialogue?.value.setActive(true);
}

function closeLastFmDisconnectDialogue() {
  testDialogue?.value.setActive(false);
}

async function disconnectLastFm() {
  await window.ftStore.deleteKey('lastfmSk');
  await window.ftStore.deleteKey('lastfmName');
  lastFmKeySet.value = false;
  testDialogue?.value.setActive(false);
}

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
    <ButtonOption v-if="!lastFmKeySet" :action="openLastFmModal" class="lastfm" :label="$t('SETTINGS.LASTFM_INTEGRATION_DISCONNECTED')" :btn-label="$t('SETTINGS.BUTTON.CONNECT_LASTFM')" />
    <ButtonOption v-if="lastFmKeySet" :action="openLastFmDisconnectDialogue" label="Disconnect Last.fm from Firetail" btn-label="Disconnect"></ButtonOption>
    <SwitchOption v-if="lastFmKeySet" :action="pauseLastFmAction" label="Pause scrobbling to Last.fm" store-key="lastfmPause" store-category="lastfm" />
  </section>
  <Modal title="Last.fm Integration" ref="lastfmModal"><LastFmModal/></Modal>
  <Dialogue title="Disconnect Last.fm" :buttons="[{label: 'Cancel', click: closeLastFmDisconnectDialogue}, {label: 'Disconnect', click: disconnectLastFm}]" ref="testDialogue">This is a test dialogue.</Dialogue>
</template>

<style scoped lang="scss">

</style>