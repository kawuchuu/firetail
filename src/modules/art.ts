import {getResource} from "./get-resource";

export async function getArt(artist:string, album?:string, title?:string) {
  const imagePath = await window.path.getImages();
  const albumOrTitle = album ?? title;
  return getResource(`${imagePath}/${(artist + albumOrTitle).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, '')}.jpg`);
}

export function getArtSync(artist:string, album?:string, title?:string) {
  const imagePath = window.path.getImagesSync();
  const albumOrTitle = album ?? title;
  return getResource(`${imagePath}/${(artist + albumOrTitle).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, '')}.jpg`);
}

export function getImagePath() {
  return window.path.getImagesSync();
}

export function formatArtPath(path:string, artist:string, album?:string, title?:string) {
  const albumOrTitle = album ?? title;
  return getResource(`${path}/${(artist + albumOrTitle).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, '')}.jpg`);
}

export function getFileArtPath(path: string, artist: string, album?: string, title?: string) {
  const albumOrTitle = album ?? title;
  return `file:///${path}/${(artist + albumOrTitle).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, '')}.jpg`;
}