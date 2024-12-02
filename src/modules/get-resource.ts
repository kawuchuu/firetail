export function getImageResource(path: string) {
  return `local-resource://${encodeURIComponent(path.replaceAll('\\', '/'))}`
}

export function getAudioResource(path: string) {
  return `local-resource://${encodeURIComponent(path.replaceAll('\\', '/'))}`
}