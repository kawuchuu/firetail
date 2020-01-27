const app = require('electron').remote.app;
const path = require('path');
const Vue = require('vue/dist/vue');
const fs = require('fs');

let list = new Worker('./ftmodules/list.js');
let imgServer = new Worker('./ftmodules/server.js');
let audio;
let allSongs = [];
let currentSong;
let currentSongIndex;
let compareListOrder = [];
let nonCurrentView = [];
let currentListViewing = 'Songs';
let lastView = 'Songs';
let currentlyPlaying = false;
let repeatEnabled = false;
let ver = app.getVersion();

imgServer.postMessage(app.getPath('userData'));

document.title = `Firetail ${ver}`

/* Song List */
Vue.component('list-item', {
    props: ['song'],
    template: `<li v-on:mouseover="hover" v-on:mouseleave="leave" class="results-link"><i v-on:click="play(true)" v-on:mouseover="hover(true)" v-on:mouseleave="leave" class="material-icons-rounded play-pause" style="opacity: 0;">play_arrow</i><div v-on:dblclick="play" class="artist-title-album"><p class="list-title">{{ song.title }}</p><p class="list-artist" v-on:click="artist">{{song.artist}}</p><p class="list-album" v-on:click="album">{{song.album}}</p></div></li>`,
    methods: {
        play(btn) {
            compareListOrder = [];
            nonCurrentView = [];
            listItems.songList.forEach(f => {
                compareListOrder.push(f.id);
                nonCurrentView.push(f);
            });
            lastView = currentListViewing;
            if (this.$vnode.key == currentSong && btn == true) {
                if (playPauseButton.paused == true) {
                    playPause(false);
                    this.$el.childNodes[0].textContent = 'pause';
                } else {
                    playPause(true)
                }
                return;
            }
            currentSong = this.$vnode.key;
            currentSongIndex = listItems.songList.indexOf(allSongs[currentSong]);
            if (shuffleEnabled == true) {
                shuffle(nonCurrentView);
                compareListOrder = [];
                nonCurrentView.forEach(f => {
                    compareListOrder.push(f.id);
                });
            }
            updateActive(btn);
            playSong(currentSong);
        },
        hover(btn) {
            if (this.$vnode.key == currentSong && btn == true && playPauseButton.paused == false) {
                if (currentListViewing == lastView) {
                    this.$el.childNodes[0].textContent = 'pause';
                }
            }
            this.$el.childNodes[0].style.opacity = 1;
        },
        leave() {
            if (this.$vnode.key == currentSong) {
                if (currentListViewing == lastView) {
                    if (playPauseButton.paused == true) {
                        this.$el.childNodes[0].textContent = 'play_arrow';
                        return;
                    }
                    this.$el.childNodes[0].textContent = 'volume_up';
                    return;
                }
            }
            this.$el.childNodes[0].style.opacity = 0;
        },
        artist() {
            getArtist(allSongs[this.$vnode.key].artist);
        },
        album() {
            getAlbum(allSongs[this.$vnode.key].album);
        }
    }
});

let updateActive = (btn) => {
    try {
        document.querySelectorAll('.results-link').forEach(f => {
            f.classList.remove('active');
            f.childNodes[0].style.opacity = 0;
            f.childNodes[0].textContent = 'play_arrow';
            f.childNodes[0].id = '';
        });
        let el = document.querySelector('.list-wrapper').childNodes[currentSongIndex + 2];
        el.classList.add('active');
        el.childNodes[0].id = 'active';
        if (btn == true) {
            el.childNodes[0].textContent = 'pause';
        } else {
            el.childNodes[0].textContent = 'volume_up';
        }
        el.childNodes[0].style.opacity = 1;
    } catch(err) {
        'lmao'
    }
}

let listItems = new Vue({
    el: ".list-wrapper",
    data: {
        songList: []
    }
});

list.postMessage({'userData': app.getPath('userData')});

list.onmessage = async (message) => {
    if (message.data == false) {
        listItems.songList = [];
        document.querySelector('.load-spinner').style.display = 'none';
        listTitle.list.count = "0 songs"
        return document.querySelector('.no-songs-found').style.display = 'block';
    } else {
        document.querySelector('.no-songs-found').style.display = 'none';
    }
    artistList = message.data[1];
    albumList = message.data[2];
    message = message.data[0];
    allSongs = [];
    message.forEach(f => {
        allSongs.push(f);
    });
    artists.artistList = sortArray(artistList, 'artist');
    albums.albumList = sortArray(albumList, 'album');
    listItems.songList = message;
    compareListOrder = [];
    nonCurrentView = [];
    updateListOrder('artist');
    if (currentlyPlaying == true) {
        listItems.songList.forEach(f => {
            compareListOrder.push(f.id);
            nonCurrentView.push(f);
        });
        if (shuffleEnabled == true) {
            shuffle(nonCurrentView);
            compareListOrder = [];
            nonCurrentView.forEach(f => {
                compareListOrder.push(f.id);
            });
        }
    }
    document.querySelector('.load-spinner').style.display = 'none';
}

let sortArray = (array, sortBy) => {
    function compare(a, b) {
        if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) return -1;
        if (a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) return 1;
    }
    return array.sort(compare);
}

let simpleSort = (array) => {
    function compare(a, b) {
        if (a.toLowerCase() < b.toLowerCase()) return -1;
        if (a.toLowerCase() > b.toLowerCase()) return 1;
    }
    return array.sort(compare);
}

let shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
}

let updateListOrder = async (sortBy, compUpdate) => {
    let bruhbruh = new Promise(resolve => {
        let sortByOrder = {};
        listItems.songList.forEach(f => {
            if (sortByOrder[f[sortBy]] == undefined) {
                sortByOrder[f[sortBy]] = [];
            } 
            sortByOrder[f[sortBy]].push(f);
        });
        let sortKeys = simpleSort(Object.keys(sortByOrder));
        let finalSongArray = [];
        sortKeys.forEach(f => {
            sortByOrder[f] = sortArray(sortByOrder[f], 'title');
            sortByOrder[f].forEach(f => {
                finalSongArray.push(f);
            })
        })
        listItems.songList = finalSongArray;
        resolve(true);
    });
    await bruhbruh;
    let usePlural = 'songs';
    if (listItems.songList.length == 1) {
        usePlural = 'song'
    }
    listTitle.list.count = `${listItems.songList.length} ${usePlural}`;
    if (compUpdate == true) {
        compareListOrder = [];
        nonCurrentView = [];
        listItems.songList.forEach(f => {
            compareListOrder.push(f.id);
            nonCurrentView.push(f);
        });
    }
    document.querySelectorAll('.results-link').forEach(f => {
        f.classList.remove('active');
        f.childNodes[0].style.opacity = 0;
        f.childNodes[0].textContent = 'play_arrow';
        f.childNodes[0].id = '';
    });
    if (currentSong != undefined) {
        if (currentListViewing == lastView) {
            let findSong = listItems.songList.indexOf(allSongs[currentSong])
            let el = document.querySelector('.list-wrapper').childNodes[findSong + 2];
            if (el) {
                el.classList.add('active');
                el.childNodes[0].id = 'active';
                el.childNodes[0].textContent = 'volume_up';
                el.childNodes[0].style.opacity = 1;
            }
        }
    }
}

/* Play Song */
function timeFormat(s) {
    let min = Math.floor(s / 60);
    let sec = Math.floor(s - (min * 60));
    if (sec < 10){ 
        sec = `0${sec}`;
    }
    return `${min}:${sec}`;
}

let artTimeout;

let playSong = async (songId) => {
    clearTimeout(artTimeout);
    let albumArtEl = document.querySelector('.song-album-art');
    let songFile = allSongs[songId].file;
    let songTitle = allSongs[songId].title;
    let songArtist = allSongs[songId].artist;
    if (audio) {
        audio.removeEventListener('timeupdate', timeUpdate);
        audio.src = songFile;        
    } else {
        audio = new Audio(songFile);
    }
    currentlyPlaying = true;
    audio.play();
    playPause(false, true);
    audio.addEventListener('timeupdate', timeUpdate)
    songInfo.title = songTitle;
    songInfo.artist = songArtist;
    let albumName = allSongs[songId].album.replace(/[.:<>"*?/{}()|[\]\\]/g, "_");
    let img = `http://localhost:56743/${albumName}.jpg`
    new Promise(resolve => {
        let request = new XMLHttpRequest();
        request.open('GET', img, true);
        request.onload = function(e) {
            if (e.target.status == 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        }
        request.send();
    }).then(exists => {
        if (exists == false) {
            img = path.join(__dirname, '../assets/no_image.svg').replace(/[\\]/g, "/");
        }
        artTimeout = setTimeout(() => {
            albumArtEl.style.background = "url('" + img.replace(/[']/g, "\\'") + "')";
        }, 200)
    });
}

/* Song Info */
let songInfo = new Vue({
    el: ".song-info",
    data: {
        title: 'Song Title',
        artist: 'Song Artist'
    }
});

/* Controls */
let timeUpdate = () => {
    if (isNaN(audio.duration) == true) {
        document.getElementById('songDurationLength').innerHTML = `-:--`
    } else {
        duration = timeFormat(audio.duration);
        document.getElementById('songDurationLength').innerHTML = duration
    }
    let p = audio.currentTime / audio.duration;
    document.querySelector('#seekFill').style.width = p * 100 + '%';
    let songLength = parseInt(audio.currentTime);
    timeNow = timeFormat(songLength);
    document.getElementById('songDurationTime').innerHTML = timeNow;
    if (repeatEnabled == true && audio.currentTime >= audio.duration - 0.1) {
        audio.currentTime = 0;
        setTimeout(() => {
            audio.play();
        }, 10)
    }
    if (audio.currentTime === audio.duration) {
        skipSong('next');
    }
}

let shuffleEnabled = false;

let skipSong = (action) => {
    if (action == 'next') {
        currentSongIndex = compareListOrder.indexOf(currentSong) + 1;
        if (currentSongIndex >= compareListOrder.length) currentSongIndex = 0;
    } else if (action == 'prev') {
        currentSongIndex = compareListOrder.indexOf(currentSong) - 1;
        if (currentSongIndex == -1) currentSongIndex = nonCurrentView.length - 1;
    }
    currentSong = nonCurrentView[currentSongIndex].id;
    document.querySelectorAll('.results-link').forEach(f => {
        f.classList.remove('active');
        f.childNodes[0].style.opacity = 0;
        f.childNodes[0].textContent = 'play_arrow';
        f.childNodes[0].id = '';
    });
    let findSong = listItems.songList.indexOf(allSongs[currentSong])
    if (currentListViewing == lastView) {
        let el = document.querySelector('.list-wrapper').childNodes[findSong + 2];
        if (el) {
            el.classList.add('active');
            el.childNodes[0].id = 'active';
            el.childNodes[0].textContent = 'volume_up';
            el.childNodes[0].style.opacity = 1;
        }
    }
    playSong(currentSong);
}

let playPauseButton = new Vue({
    el: '#playPauseBtn',
    data: {
        icon: 'play_arrow',
        paused: true
    },
    methods: {
        click() {
            if (playPauseButton.paused == true) {
                playPause(false);
            } else {
                playPause(true);
            }
        }
    }
});

new Vue({
    el: '#prevButton',
    methods: {
        click() {
            skipSong('prev')
        }
    }
});

new Vue({
    el: '#nextButton',
    methods: {
        click() {
            skipSong('next')
        }
    }
})

new Vue({
    el: '#shuffleButton',
    methods: {
        click() {
            if (shuffleEnabled == false) {
                shuffle(nonCurrentView);
                document.querySelector('#shuffleButton').classList.add('active');
                shuffleEnabled = true;
            } else {
                let sortByOrder = {};
                nonCurrentView.forEach(f => {
                    if (sortByOrder[f['artist']] == undefined) {
                        sortByOrder[f['artist']] = [];
                    } 
                    sortByOrder[f['artist']].push(f);
                });
                let sortKeys = simpleSort(Object.keys(sortByOrder));
                let finalSongArray = [];
                sortKeys.forEach(f => {
                    sortByOrder[f] = sortArray(sortByOrder[f], 'title');
                    sortByOrder[f].forEach(f => {
                        finalSongArray.push(f);
                    })
                })
                nonCurrentView = finalSongArray;
                document.querySelector('#shuffleButton').classList.remove('active');
                shuffleEnabled = false;
            }
            compareListOrder = [];
            nonCurrentView.forEach(f => {
                compareListOrder.push(f.id);
            });
        }
    }
})

new Vue({
    el: '#repeatButton',
    methods: {
        click() {
            if (!repeatEnabled) {
                document.querySelector('#repeatButton').classList.add('active');
                repeatEnabled = true;
            } else {
                document.querySelector('#repeatButton').classList.remove('active');
                repeatEnabled = false;
            }
        }
    }
})

let playPause = (pause, listbtn) => {
    if (pause == true) {
        playPauseButton.paused = true;
        playPauseButton.icon = 'play_arrow';
        try {
            if (!listbtn) {
                document.querySelector('#active').textContent = 'play_arrow';
            }
        } catch(err) {
            'doesnt exist'
        }
        audio.pause();
    } else {
        playPauseButton.paused = false;
        playPauseButton.icon = 'pause';
        try {
            if (!listbtn) {
                document.querySelector('#active').textContent = 'volume_up';
            }
        } catch(err) {
            'doesnt exist'
        }
        audio.play();
    }
}

/* Seek bar */
let seekBar;
let seekBarWrapper;
let seekFillBar;
setTimeout(() => {
    seekBar = document.querySelector('.seek-bar');
    seekBarWrapper = document.querySelector('#seekWrapper');
    seekFillBar = document.querySelector('#seekFill');
}, 50)
let seekMouseDown = false;

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

function seekGetP(e) {
    seekP = (e.clientX - seekBar.getBoundingClientRect().x) / seekBar.clientWidth;
    seekP = clamp(0, seekP, 1);
    return seekP;
}

function mousetouchdown(e) {
    if (currentlyPlaying) {
        if (e.touches) {
            e = e.touches[0]
        }
        seekMouseDown = true;
        seekP = seekGetP(e);
        seekFillBar.style.width = seekP * 100 + '%';
        audio.removeEventListener('timeupdate', timeUpdate);
        document.querySelector('#seekHandle').classList.add('handle-hover')
    }
}

function mousetouchmove(e) {
    if (!seekMouseDown) return;
    if (currentlyPlaying) {
        if (seekMouseDown) {
            seekFillBar.style.transition = 'none';
            if (e.touches) {
                e = e.touches[0]
            }
            seekP = seekGetP(e);
            seekFillBar.style.width = seekP * 100 + '%';
            minutes = Math.floor((seekP * audio.duration) / 60);
            seconds = Math.floor((seekP * audio.duration) / 1);
            while (seconds >= 60) {
                seconds = seconds - 60;
            }
            if (seconds > -1 && seconds < 10) {
                seconds = ('0' + seconds).slice(-2);
            }
            document.querySelector('#songDurationTime').innerHTML = `${minutes}:${seconds}`
        }
    }
}

function mousetouchup(e) {
    if (!seekMouseDown) return;
    seekFillBar.style.transition = '0.1s';
    if (currentlyPlaying) {
        if (seekMouseDown) {
            if (e.changedTouches) {
                e = e.changedTouches[0]
            }
            seekMouseDown = false;
            seekP = seekGetP(e);
            seekFillBar.style.width = seekP * 100 + '%';
            audio.currentTime = seekP * audio.duration;
            audio.addEventListener('timeupdate', timeUpdate);
            document.querySelector('#seekHandle').classList.remove('handle-hover')
        }
    }
}

Vue.component('seekbar', {
    template: `<div id="seekWrapper" v-on:mouseover="hover" v-on:mousedown="down" v-on:mouseleave="leave" class="seek-bar-inner-container"><div class="seek-bar"><div id="seekFill" class="fill"></div><div id="seekHandle" class="handle"></div></div></div>`,
    methods: {
        down(e) {
            mousetouchdown(e);
        },
        hover() {
            document.querySelector('#seekHandle').classList.add('handle-hover');
        },
        leave() {
            if (seekMouseDown) return;
            document.querySelector('#seekHandle').classList.remove('handle-hover')
        }
    }
});

window.addEventListener('mousemove', function (e) {
    mousetouchmove(e)
});

window.addEventListener('mouseup', function (e) {
    mousetouchup(e);
});

new Vue({
    el: '.seek-time-inner-container'
})

/* Tabs */
Vue.component('side-buttons', {
    props: ['button'],
    template: '<div class="item-sidebar" v-on:click="click"><div class="active-indicator"></div><i class="material-icons-rounded">{{ button.icon }}</i><span>{{ button.name }}</span></div>',
    methods: {
        click(e) {
            let tabClicked = this.$vnode.key;
            document.querySelector('.item-sidebar.active .active-indicator').style.display = 'none';
            document.querySelector('.item-sidebar.active').classList.remove('active')
            this.$el.classList.add('active');
            document.querySelector('.item-sidebar.active .active-indicator').style.display = 'block';
            document.querySelector('.track-list').style.display = 'none';
            let tabs = document.querySelectorAll('.artist-album-list');
            tabs.forEach(f => {
                f.style.display = 'none';
            });
            if (tabClicked != 'songsTab') {
                document.querySelector(`#${tabClicked} .artists-albums-container`).style.display = 'flex';
                document.querySelector(`#${tabClicked}`).style.display = 'block';
            }
            if (tabClicked == 'songsTab' && nonCurrentView != listItems.songList) {
                document.querySelector(`#songsTab`).style.display = 'flex';
                currentListViewing = 'Songs';
                listTitle.list.title = 'All Songs';
                listItems.songList = [];
                allSongs.forEach(f => {
                    listItems.songList.push(f);
                })
                updateListOrder('artist');
                document.querySelector('.songs-page').scroll(0,0);
            }
        }
    },
    mounted() {
        if (this.$vnode.key == 'songsTab') {
            this.$el.classList.add('active');
            document.querySelector('.item-sidebar.active .active-indicator').style.display = 'block';
        }
    }
})

let sideButtons = new Vue({
    el: '.nav-buttons',
    data: {
        section1: [
            {'icon': 'music_note', 'name': 'Songs', 'id': 'songsTab'},
            {'icon': 'person', 'name': 'Artists', 'id': 'artistsTab'},
            {'icon': 'album', 'name': 'Albums', 'id': 'albumsTab'}
        ],
        section2: [
            {'icon': 'playlist_play', 'name': 'Playlists', 'id': 'playlistsTab'}
        ],
        section3: [
            {'icon': 'settings', 'name': 'Settings', 'id': 'settingsTab'}
        ]
    }
})

let listTitle = new Vue({
    el: '.tab-title-text',
    data: {
        list: {
            'title': 'All Songs',
            'count': '0 songs'
        }
    }
})

/* Add songs */
let songAddInfo = new Vue({
    el: '.add-songs-notify',
    data: {
        addInfo: 'Adding 0 songs to your library...',
        icon: 'autorenew'
    }
});

document.querySelector('#addFiles').addEventListener('change', (el) => {
    addSongs(el.target.files);
})

let fileWorker = new Worker('./ftmodules/files.js');
let progressTotal = 0;

let addSongs = async (files) => {
    document.querySelector('.add-songs-notify').style.display = 'flex'
    document.querySelector('.add-icon').classList.add('spin');
    songAddInfo.icon = 'autorenew';
    if (files.length == 1) {
        songAddInfo.addInfo = `Adding 1 song to your library...`
    } else {
        songAddInfo.addInfo = `Adding ${files.length} songs to your library...`
    }
    songAddInfo.num = files.length;
    progressTotal = files.length;
    fileWorker.postMessage([files, app.getPath('userData')]);
}

fileWorker.onmessage = async (metadata) => {
    if (metadata.data[1] == false) {
        document.querySelector('.notify-progbar').style.width = (metadata.data[0] / progressTotal) * 100 + '%';
        return;
    }
    setTimeout(() => {
        document.querySelector('.notify-progbar').style.width = '0%';
        message = metadata.data[0];
        document.querySelector('.add-icon').classList.remove('spin');
        songAddInfo.icon = 'check'
        if (message == undefined) message = 0;
        if (message == 1) {
            songAddInfo.addInfo = `Added 1 song to your library`
        } else {
            songAddInfo.addInfo = `Added ${message} songs to your library`
        }
        list.postMessage({'userData': app.getPath('userData')});
        setTimeout(() => {
            document.querySelector('.add-songs-notify').style.display = 'none';
        }, 2000)
    }, 100)
}

/* Artists page */
let getArtist = artistClicked => {
    listItems.songList = [];
    allSongs.forEach(f => {
        if (f.artist == artistClicked) {
            listItems.songList.push(f);
        }
    });
    currentListViewing = `artist-${artistClicked}`;
    listTitle.list.title = artistClicked;
    document.querySelector('.artist-album-list').style.display = 'none';
    document.querySelector(`#songsTab`).style.display = 'flex';
    updateListOrder('album');
    document.querySelector('.songs-page').scroll(0,0);
}

let getAlbum = albumClicked => {
    listItems.songList = [];
    allSongs.forEach(f => {
        if (f.album == albumClicked) {
            listItems.songList.push(f);
        }
    });
    currentListViewing = `album-${albumClicked}`;
    listTitle.list.title = albumClicked;
    document.querySelector('.artist-album-list').style.display = 'none';
    document.querySelector('.albums-container').style.display = 'none';
    document.querySelector(`#songsTab`).style.display = 'flex';
    updateListOrder('title');
    document.querySelector('.songs-page').scroll(0,0);
}

Vue.component('artist-item', {
    props: ['artist'],
    template: '<div v-on:click="click" class="artist-item"><h3>{{ artist.artist }}</h3></div>',
    methods: {
        click() {
            getArtist(this.$vnode.key);
        }
    }
});

let artists = new Vue({
    el: '.artists-container',
    data: {
        artistList: []
    }
})

/* Albums page */
Vue.component('album-item', {
    props: ['album'],
    template: '<div v-on:click="click" class="artist-item"><h3>{{ album.album }}</h3></div>',
    methods: {
        click() {
            getAlbum(this.$vnode.key);
        }
    }
});

let albums = new Vue({
    el: '.albums-container',
    data: {
        albumList: []
    }
})

/* top bar button shit */
document.querySelector('#nuke').addEventListener('click', () => {
    fs.unlink(app.getPath('userData') + '/library.json', (err) => {
        if (err) console.error(err);
        list.postMessage({'userData': app.getPath('userData')});
    });
});

/* Playlists */
let playlists = new Vue({
    el: '.playlists-container',
    data: {
        playlistList: []
    }
});

Vue.component('playlist-item', {
    props: ['playlist']
});