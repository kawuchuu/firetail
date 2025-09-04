import {infoStore} from "../renderer";
import {LastFMSession} from "../types/LastFM";

export async function updateNowPlaying(artist: string, track: string) {
  if (await !window.ftStore.keyExists('lastfmSk')) return;
  const sk = await window.ftStore.secureGetItem('lastfmSk');
  const query = new URLSearchParams();
  query.set('artist', artist);
  query.set('track', track);
  query.set('sk', sk);
  fetch(`${infoStore.lastfmProxyUrl}updateNowPlaying?${query.toString()}`, {
    method: 'POST',
  }).then(r => {
    console.log(r.status);
  });
}

export async function scrobble(artist: string, track: string, timestamp: number) {
  if (await !window.ftStore.keyExists('lastfmSk')) return;
  const sk = await window.ftStore.secureGetItem('lastfmSk');
  const query = new URLSearchParams();
  query.set('artist', artist);
  query.set('track', track);
  query.set('sk', sk);
  query.set('timestamp', timestamp.toString());
  fetch(`${infoStore.lastfmProxyUrl}scrobble?${query.toString()}`, {
    method: 'POST',
  }).then(r => {
    console.log(r.status);
  });
}

export async function getToken() {
  try {
    const req = await fetch(`${infoStore.lastfmProxyUrl}getToken`);
    const token = await req.json();
    return token.token;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

export async function getSession(token: string):Promise<LastFMSession> {
  try {
    const req = await fetch(`${infoStore.lastfmProxyUrl}getSession?token=${token}`);
    return await req.json();
  } catch(err) {
    console.error(err);
    throw err;
  }
}

export const apiKey = '81903772b1e08807a7500eb5c0718f27';