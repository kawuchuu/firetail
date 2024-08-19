export async function getArt(artist:string, album:string) {
  const imagePath = await window.path.getImages();
  return `local-resource://${imagePath}/${encodeURIComponent((artist + album).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, ''))}.jpg`;
}

export function getArtSync(artist:string, album:string) {
  const imagePath = window.path.getImagesSync();
  return `local-resource://${imagePath}/${encodeURIComponent((artist + album).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, ''))}.jpg`;
}

export function getImagePath() {
  return window.path.getImagesSync();
}

export function formatArtPath(path:string, artist:string, album:string) {
  return `local-resource://${path}/${encodeURIComponent((artist + album).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, ''))}.jpg`;
}