<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import Modal from "../Modal.vue";
import StandardButton from "../StandardButton.vue";
import FiretailSong from "../../types/FiretailSong";
import {SongFileInfo} from "../../types/SongFileInfo";
import {getArt} from "../../modules/art";
import {timeFormat} from "../../modules/timeformat";

const open = defineModel<boolean>('open', {default: false});

const props = defineProps<{
  song: FiretailSong | null;
}>();

interface InfoRow {
  label: string;
  value: string;
  note?: string;
}

interface TextPart {
  text: string;
  url?: string;
}

const {t, locale} = useI18n();

const info = ref<SongFileInfo | null>(null);
const loading = ref(false);
const failed = ref(false);
const imagePath = ref('');
let request = 0;

async function load(song: FiretailSong | null) {
  const current = ++request;
  info.value = null;
  failed.value = false;
  imagePath.value = '';
  if (!song) return;
  loading.value = true;
  if (song.hasImage === 1) {
    getArt(song.albumArtist, song.album).then(path => {
      if (current === request) imagePath.value = path;
    });
  }
  try {
    const result = await window.library.getSongFileInfo(song.id);
    if (current !== request) return;
    info.value = result;
    failed.value = !result;
  } catch (err) {
    console.error(err);
    if (current === request) failed.value = true;
  } finally {
    if (current === request) loading.value = false;
  }
}

watch(() => [open.value, props.song] as const, ([isOpen, song]) => {
  if (isOpen) load(song);
}, {immediate: true});

function parseList(value: string[] | string | undefined | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [value];
  }
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(locale.value, {maximumFractionDigits}).format(value);
}

function formatSize(bytes: number) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${formatNumber(value, unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function formatChannels(channels: number) {
  if (channels === 1) return t('SONG_INFO.MONO');
  if (channels === 2) return t('SONG_INFO.STEREO');
  return t('SONG_INFO.CHANNEL_COUNT', {count: formatNumber(channels)});
}

function compact(rows: (InfoRow | false | undefined | null)[]): InfoRow[] {
  return rows.filter((row): row is InfoRow => !!row && row.value !== '');
}

const artists = computed(() => {
  const all = parseList(props.song?.allArtists);
  return all.length > 0 ? all.join(', ') : props.song?.artist ?? '';
});

const genres = computed(() => parseList(props.song?.genre));

const trackRows = computed(() => {
  const song = props.song;
  if (!song) return [];
  const file = info.value;
  return compact([
    {label: t('SONG_INFO.ALBUM_ARTIST'), value: song.albumArtist ?? ''},
    song.trackNum != null && {label: t('SONG_INFO.TRACK_NUMBER'), value: formatNumber(song.trackNum)},
    song.disc != null && {label: t('SONG_INFO.DISC'), value: formatNumber(song.disc)},
    {label: t('SONG_INFO.YEAR'), value: song.year ?? ''},
    file && {label: t('SONG_INFO.COMPOSER'), value: file.composer.join(', ')},
    file?.bpm && {label: t('SONG_INFO.BPM'), value: formatNumber(file.bpm)},
    file && {label: t('SONG_INFO.LABEL'), value: file.label.join(', ')},
  ]);
});

const formatLabel = computed(() => {
  const file = info.value;
  if (!file) return '';
  const name = file.codec ?? file.container ?? '';
  return file.codecProfile ? `${name} (${file.codecProfile})` : name;
});

const fileRows = computed(() => {
  const file = info.value;
  if (!file) return [];
  return compact([
    {label: t('SONG_INFO.FORMAT'), value: formatLabel.value, note: file.lossless === undefined ? undefined : file.lossless ? t('SONG_INFO.LOSSLESS') : t('SONG_INFO.LOSSY')},
    file.bitrate && {label: t('SONG_INFO.BITRATE'), value: `${formatNumber(Math.round(file.bitrate / 1000))} kbps`},
    file.sampleRate && {label: t('SONG_INFO.SAMPLE_RATE'), value: `${formatNumber(file.sampleRate / 1000, 1)} kHz`},
    file.bitsPerSample && {label: t('SONG_INFO.BIT_DEPTH'), value: t('SONG_INFO.BITS', {count: formatNumber(file.bitsPerSample)})},
    file.channels && {label: t('SONG_INFO.CHANNELS'), value: formatChannels(file.channels)},
    {label: t('SONG_INFO.SIZE'), value: formatSize(file.size)},
    {label: t('SONG_INFO.MODIFIED'), value: new Intl.DateTimeFormat(locale.value, {dateStyle: 'medium', timeStyle: 'short'}).format(file.modified)},
    {label: t('SONG_INFO.TAGS'), value: file.tagTypes.join(', ')},
    {label: t('SONG_INFO.ENCODER'), value: file.tool ?? ''},
  ]);
});

const URL_PATTERN = /(https?:\/\/[^\s<>"]+[^\s<>".,;:!?)\]])/gi;

const commentParts = computed<TextPart[]>(() => {
  const text = info.value?.comment.join('\n').trim() ?? '';
  if (!text) return [];
  return text.split(URL_PATTERN).filter(Boolean).map(part => /^https?:\/\//i.test(part) ? {text: part, url: part} : {text: part});
});

function openLink(url: string) {
  window.misc.openBrowser(url);
}

const filePath = computed(() => info.value?.path ?? props.song?.path ?? '');

function reveal() {
  if (props.song) window.library.revealSong(props.song.id);
}
</script>

<template>
  <Modal v-model:open="open" :title="t('SONG_INFO.TITLE')" class="song-info-modal">
    <div v-if="song" class="song-info">
      <div class="song-header">
        <div class="art inner-outline" :style="imagePath ? {backgroundImage: `url('${imagePath}')`} : {}"></div>
        <div class="header-text">
          <h2 class="title">
            <span class="title-text">{{ song.title }}</span>
            <span v-if="song.explicit == 1" class="explicit">E</span>
          </h2>
          <p class="artist">{{ artists }}</p>
          <div class="additional-info">
            <span v-if="song.album" class="icon-label"><i class="ft-icon">album</i><span>{{ song.album }}</span></span>
            <span v-if="song.realdur" class="icon-label"><i class="ft-icon">clock</i><span>{{ timeFormat(song.realdur) }}</span></span>
          </div>
          <div v-if="genres.length > 0" class="genres">
            <span v-for="genre in genres" :key="genre">{{ genre }}</span>
          </div>
        </div>
      </div>

      <section v-if="trackRows.length > 0 || commentParts.length > 0">
        <h3 class="subtitle">{{ t('SONG_INFO.TRACK') }}</h3>
        <dl v-if="trackRows.length > 0" class="specs">
          <div v-for="row in trackRows" :key="row.label" class="spec">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
        <div v-if="commentParts.length > 0" class="comment">
          <p class="comment-label">{{ t('SONG_INFO.COMMENT') }}</p>
          <p class="comment-text"><template v-for="(part, index) in commentParts" :key="index"><a v-if="part.url" :href="part.url" @click.prevent="openLink(part.url)">{{ part.text }}</a><template v-else>{{ part.text }}</template></template></p>
        </div>
      </section>

      <section>
        <h3 class="subtitle">{{ t('SONG_INFO.FILE') }}</h3>
        <p v-if="loading" class="status">{{ t('SONG_INFO.LOADING') }}</p>
        <p v-else-if="failed" class="status">{{ t('SONG_INFO.UNAVAILABLE') }}</p>
        <dl v-else class="specs">
          <div v-for="row in fileRows" :key="row.label" class="spec">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}<span v-if="row.note" class="spec-note">{{ row.note }}</span></dd>
          </div>
        </dl>
        <div class="location">
          <p class="path">{{ filePath }}</p>
          <StandardButton :disabled="failed" @click="reveal">{{ t('SONG_INFO.SHOW_FILE') }}</StandardButton>
        </div>
      </section>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.song-info {
  margin: 0 2px 18px;
  display: flex;
  flex-direction: column;
}

.song-header {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: start;
  gap: 20px;
}

.art {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 10px;
  background-image: url('../../assets/no_album.svg');
  background-color: var(--sub-fg);
  background-position: center;
  background-size: cover;
}

.art::after {
  border-radius: 10px;
}

.header-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-top: 6px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 4px;
  font-size: 1.4em;
  font-weight: 700;
  line-height: 1.2;
}

.boldText .title {
  font-weight: 800;
}

.title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  user-select: text;
}

.explicit {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
  background: white;
  border-radius: 2px;
  color: black;
}

.artist {
  margin: 0 0 10px;
  opacity: 0.75;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.additional-info {
  display: flex;
  align-items: center;
  min-width: 0;

  > span {
    display: flex;
    align-items: center;
    min-width: 0;
    font-size: 14px;

    i {
      margin-right: 4px;
      font-size: 20px;
    }

    span {
      opacity: 0.65;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  > span:not(:last-child)::after {
    content: "\2022";
    padding: 0 10px;
    opacity: 0.65;
  }
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;

  span {
    padding: 3px 10px;
    font-size: 13px;
    background: var(--fg-bg);
    border-radius: 200px;
  }
}

.subtitle {
  font-size: 1.1em;
  font-weight: 600;
  border-bottom: solid 1px var(--bd-op);
  padding-bottom: 8px;
  margin: 24px 0 12px;
}

.boldText .subtitle {
  font-weight: bold;
}

.specs {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 20px;
}

.spec {
  min-width: 0;

  dt {
    font-size: 12px;
    opacity: 0.65;
    margin-bottom: 2px;
  }

  dd {
    margin: 0;
    font-size: 14px;
    overflow-wrap: anywhere;
    user-select: text;
  }
}

.spec-note {
  margin-left: 6px;
  font-size: 12px;
  opacity: 0.65;
}

.comment {
  margin-top: 12px;
}

.comment-label {
  margin: 0 0 2px;
  font-size: 12px;
  opacity: 0.65;
}

.comment-text {
  margin: 0;
  max-width: 65ch;
  font-size: 14px;
  line-height: 1.45;
  white-space: pre-line;
  overflow-wrap: anywhere;
  user-select: text;

  a {
    color: #3ea8ff;
    text-decoration: underline;
    cursor: pointer;
  }
}

.status {
  margin: 0;
  font-size: 14px;
  opacity: 0.65;
}

.location {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding-top: 8px;
  border-top: solid 1px var(--bd-op);
}

.path {
  margin: 0;
  min-width: 0;
  font-size: 12px;
  opacity: 0.5;
  overflow-wrap: anywhere;
  user-select: text;
}

.location :deep(.button) {
  flex-shrink: 0;
  margin-right: -15px;
}

.location :deep(.button:disabled) {
  opacity: 0.4;
  pointer-events: none;
}

@media (max-width: 560px) {
  .specs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

<style lang="scss">
.song-info-modal .modal-body {
  scrollbar-gutter: stable both-edges;
}
</style>
