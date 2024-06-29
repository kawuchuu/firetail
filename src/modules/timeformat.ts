export function timeFormat(s:number) {
    if (isNaN(s)) return '-:--'
    const min = Math.floor(s / 60);
    const sec = Math.floor(s - (min * 60));
    if (sec < 10) return `${min}:0${sec}`;
    else return `${min}:${sec}`;
}