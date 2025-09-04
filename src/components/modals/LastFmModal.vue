<script setup lang="ts">
import Button from "../StandardButton.vue";
import {Ref, ref} from "vue";
import {apiKey, getToken, getSession} from "../../modules/lastfm";
import {LastFMSession} from "../../types/LastFM";

const currentPart = ref(0);
const token: Ref<string> = ref();
const didFail = ref(false);

function openBrowserScreen() {
  currentPart.value++;
  openAuthPage();
}

async function openAuthPage() {
  try {
      if (!token.value) token.value = await getToken();
      await window.misc.openBrowser(`https://last.fm/api/auth?api_key=${apiKey}&token=${token.value}`);
  } catch {
      didFail.value = true;
      currentPart.value = 3;
  }
}

async function reqSession() {
  if (!token.value) return;
  didFail.value = false;
  const resp: LastFMSession = await getSession(token.value);
  if (resp.session) {
    window.ftStore.secureSetKey("lastfmSk", resp.session.key, "lastfm");
    window.ftStore.setKey("lastfmName", resp.session.name, "lastfm");
    currentPart.value++;
  } else {
    console.log(resp);
    didFail.value = true;
  }
}
</script>

<template>
  <div class="lastfm-container">
    <div v-if="currentPart === 0">
      <p>
        On the next screen, your default browser will open to an authorisation page.
        <br/>If you authorise Firetail to access your Last.fm account, some information about your account will become accessible by Firetail.
        However, Firetail only accesses/writes the following:
      </p>
      <ul>
        <li>Your account name</li>
        <li>Update your now playing status</li>
        <li>Submit new scrobbles to your account</li>
      </ul>
      <p>No other information is accessed or written. Your session key is encrypted when stored within Firetail.</p>
      <p>
        Please note: Firetail uses a custom proxy to access your Last.fm account on your behalf.
        No activity is logged/stored about you when using the proxy.
        <br/>The proxy is open-source and is accessible within the Firetail GitHub repository.
      </p>
      <div class="buttons">
        <Button @click="openBrowserScreen">Next</Button>
      </div>
    </div>
    <div v-if="currentPart === 1">
      <p>
        Your browser should have opened a new tab with Last.fm's authorisation page.
        Once you've authorised Firetail, click Next.
      </p>
      <Button @click="openAuthPage">Open Browser</Button>
      <p v-if="didFail">Could not request a session. Please ensure you authorised Firetail to access your Last.fm account.</p>
      <div class="buttons">
        <Button @click="currentPart--">Back</Button>
        <Button @click="reqSession">Next</Button>
      </div>
    </div>
    <div v-if="currentPart === 2">
      <p>Great! Your Last.fm account is successfully connected to Firetail!</p>
    </div>
    <div v-if="currentPart === 3">
      <p>Failed to get token from Last.fm. Either Last.fm or the proxy is having issues currently.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lastfm-container {
  padding: 0 18px 18px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
}
</style>