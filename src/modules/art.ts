export async function getArt(artist:string, album:string) {
  const imagePath = await window.path.getImages();
  return `local-resource://${imagePath}/${encodeURIComponent((artist + album).replace(/[`~!@#$%^&*()_|+\-=?;:'",.<> \{\}\[\]\\\/]/gi, ''))}.jpg`;
}