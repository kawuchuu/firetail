<script setup lang="ts">
import SubtitleOption from "../options/SubtitleOption.vue";
import ButtonOption from "../options/ButtonOption.vue";
import TextOption from "../options/TextOption.vue";
import Modal from "../../Modal.vue";
import {useTemplateRef} from "vue";
import LastFmModal from "../../modals/LastFmModal.vue";

const lastfmModal = useTemplateRef('lastfmModal');
</script>

<template>
  <section class="integrations">
    <SubtitleOption>{{$t('SETTINGS.SUBTITLES.INTEGRATION')}}</SubtitleOption>
    <ButtonOption @click="lastfmModal?.setModalActive(true)" class="lastfm" :label="$t('SETTINGS.LASTFM_INTEGRATION_DISCONNECTED')" :btn-label="$t('SETTINGS.BUTTON.CONNECT_LASTFM')" />
  </section>
  <Modal title="Last.fm Integration" ref="lastfmModal"><LastFmModal/></Modal>
</template>

<style scoped lang="scss">

</style>