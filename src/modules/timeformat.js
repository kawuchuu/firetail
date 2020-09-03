export default {
    timeFormat(s) {
        let min = Math.floor(s / 60);
        let sec = Math.floor(s - (min * 60));
        if (sec < 10){ 
            sec = `0${sec}`;
        }
        return `${min}:${sec}`;
    }
}