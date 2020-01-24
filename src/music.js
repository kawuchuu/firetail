'use strict';
/**
 * Firetail - Open-source music player, built with Electron.
 * Copyright (c) projsh_ 2019
 * 
 * This project is under the terms of the GNU General Public Licence (v.3.0).
 * 
 * THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY
 * APPLICABLE LAW. EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT
 * HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY
 * OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE. THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM
 * IS WITH YOU. SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF
 * ALL NECESSARY SERVICING, REPAIR OR CORRECTION.
 * 
 * You should have recieved a copy of this licence along with this program.
 * If not, please visit the following website: http://www.gnu.org/licenses
 * 
 * Thank you Victor Tran (vicr123) for helping me with MPRIS support
 * 
 * Steinman Hall impulse response credit: http://www.echothief.com/
 * 
 * Repo: https://github.com/projsh/firetail
 */

let audio;
let currentlyPlaying = false;
let fileTotal;
let newFileChosen;
let newFileName;
let fileName;
let pauseButtonActive = false;
let currentSongPlaying;
let allFilesList = [];
let repeatEnabled = false;
let artist;
let album;
let Title;
let tags;
let shuffleEnabled = false;
let shuffleOrder = [];
let fileSongListStore = [];
let fileAudio;
let songTitleName;
let durationSongLength;
let durationSeconds;
let durationMinutes;
let seconds;
let minutes;
let seekBar = document.querySelector('.seek-bar');
let volBar = document.querySelector('.vol-bar');
let seekBarWrapper = document.querySelector('#seekWrapper');
let seekFillBar = seekBar.querySelector('#seekFill');
let audioLength = document.querySelector('#songDuration');
let volFillBar = volBar.querySelector('#volFill');
let volWrapper = document.querySelector('#volWrapper')
let seekMouseDown = false;
let volMouseDown = false;
let p;
let s = [];
let previousDuration;
let sortFileExt = {};
let shuffleList = [];
let shuffleCheck = false;
let shuffleWait = false;
let shuffleCurrent;
let highlightSong;
let currentVol = 1;
let muteSaveVol;
let volWidth;
let isMuted = false;
let shuffleEnableFirst = false;
let shuffleDisableFirst = false;
let checkForShuffle = false;
let albumArt;
let AudioContext = window.AudioContext;
let audioCtx = new AudioContext();
let gain;
let theme = 'dark';
let menuOpen = false;
let noSong = false;
const remote = require('electron').remote;
let bgImage;
let fName;
let runonce = false;
let firstrun = true;
let keepSongList = [];
let artistCheckName = {};
let albumCheckName = {};
let tabTitle = 'All Songs';
const {
    globalShortcut,
    dialog,
    app
} = require('electron').remote;
const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const id3 = require('jsmediatags');
const ipc = require('electron').ipcRenderer;
const drpc = require('discord-rpc');
const settings = require('electron-settings')
let ver = app.getVersion();
const md = require('markdown-it')();
const http = require('http');
let Controls;
let MediaPlaybackType;
let MediaPlaybackStatus;
let SystemMediaTransportControlsButton;
let BackgroundMediaPlayer;
let RandomAccessStreamReference;
let Uri;

if (process.platform == 'win32') {
    MediaPlaybackStatus = require('@nodert-win10/windows.media').MediaPlaybackStatus;
    MediaPlaybackType = require('@nodert-win10/windows.media').MediaPlaybackType;
    SystemMediaTransportControlsButton = require('@nodert-win10/windows.media').SystemMediaTransportControlsButton;
    BackgroundMediaPlayer = require('@nodert-win10/windows.media.playback').BackgroundMediaPlayer;
    RandomAccessStreamReference = require('@nodert-win10/windows.storage.streams').RandomAccessStreamReference;
    Uri = require('@nodert-win10/windows.foundation').Uri;
    Controls = BackgroundMediaPlayer.current.systemMediaTransportControls;
    Controls.isChannelDownEnabled = false;
    Controls.isChannelUpEnabled = false;
    Controls.isFastForwardEnabled = false;
    Controls.isNextEnabled = true;
    Controls.isPauseEnabled = true;
    Controls.isPlayEnabled = true;
    Controls.isPreviousEnabled = true;
    Controls.isRecordEnabled = false;
    Controls.isRewindEnabled = false;
    Controls.isStopEnabled = false;
    Controls.playbackStatus = MediaPlaybackStatus.closed;
    Controls.displayUpdater.type = MediaPlaybackType.music;

    Controls.on('buttonpressed', (sender, args) => {
        switch(args.button) {
            case SystemMediaTransportControlsButton.play:
                resumeButton();
                break;
            case SystemMediaTransportControlsButton.pause:
                resumeButton();
                break;
            case SystemMediaTransportControlsButton.next:
                nextSong();
                break;
            case SystemMediaTransportControlsButton.previous:
                previousSong();
                break;
            default:
                break;
        }
    })    
}

const express = require('express');
let imgServer = express();
let cacheDir = `${app.getPath('userData')}/Cache/`;
imgServer.use(express.static(cacheDir));

imgServer.listen(5673, 'localhost', () => {
    console.log('Image server running on: http://localhost:5673/');
})

let prerelease = true;

function isDev() {
    return process.mainModule.filename.indexOf('app.asar') === -1;
}

if (isDev() || prerelease == true) {
    ver = ver + " DEV";
    $('#openDevTools').show();
}

let mpris;
let mprisPlayer;

if (process.platform == 'linux') {
    try {
        mpris = require('mpris-service');
        mprisPlayer = new mpris({
            name: 'firetail',
            identity: 'Firetail',
            supportedInterfaces: ['player']
        });
    } catch(err) {
        console.warn('MPRIS has been disabled: unable to connect to dbus. => ' + err);
    }
}

$('#audiationVer').text(`v.${ver}`);
$('#audiationVer').dblclick(function () {
    $('#openDevTools').show();
})
$('#volFill').css({
    width: '100%'
})

if (settings.has('theme') == false) {
    settings.set('theme', 'dark');
    themeSelect('dark');
} else {
    themeSelect(settings.get('theme'));
}

if (!settings.get('mini-player-bg')) {
    settings.set('mini-player-bg', true);
}

if (settings.get('mini-player-bg') == false) {
    ipc.send('mini-bg', false);
}

if (settings.has('sidemenu') == false) {
    settings.set('sidemenu', false);
}

if (settings.has('icon-style') == false) {
    settings.set('icon-style', 'filled');
} else {
    iconStyleSelect(settings.get('icon-style'))
}

if (settings.has('colour-accent') == false) {
    settings.set('colour-accent', 'firetail');
    colouraccentSelect('firetail')
} else {
    colouraccentSelect(settings.get('colour-accent'))
}

if (settings.has('last-song') == false) {
    settings.set('last-song', null);
}

if (settings.has('last-song-time') == false) {
    settings.set('last-song-time', null);
}

if (settings.has('css-file') == false) {
    settings.set('css-file', null);
} else {
    if (settings.get('css-file') != null) {
        $('#customCSS').attr('href', settings.get('css-file'));
    }
}

let clientId = '586510014211031040';
const rpc = new drpc.Client({
    transport: 'ipc'
})

if (settings.get('discordrpc') == true) {
    async function rpcSetActivity() {
        let rpcIsIdle;
        let rpcIsPaused;
        let rpcTitle;
        if (!rpc) {
            return;
        }
        if (pauseButtonActive == true) {
            rpcIsPaused = '\u23f8'
        } else {
            rpcIsPaused = '\u25b6'
        }
        if (currentlyPlaying == false) {
            rpcIsIdle = true;
            rpcTitle = `${rpcIsPaused} Idle`
        } else {
            rpcIsIdle = false;
            rpcTitle = `${rpcIsPaused} ${Title}`
        }
        rpc.setActivity({
            details: rpcTitle,
            largeImageKey: 'large-key',
            largeImageText: 'Firetail',
            state: artist
        });
    }

    rpc.on('ready', () => {
        rpcSetActivity();
        setInterval(() => {
            rpcSetActivity();
        }, 2500)
    });

    rpc.login({
        clientId
    }).catch(console.error);
    console.log('Discord RPC has been enabled.')
}

if (process.platform == 'linux') {
    try {
        mprisPlayer.on('playpause', () => {
            resumeButton()
        });
        mprisPlayer.on("play", () => {
            resumeButton();
        });
        mprisPlayer.on("pause", () => {
            resumeButton();
        });
        mprisPlayer.on("next", () => {
            nextSong();
        })
        mprisPlayer.on("previous", () => {
            previousSong();
        })
        mprisPlayer.canPlay = false;
        mprisPlayer.canPause = false;
        mprisPlayer.canControl = false;
        mprisPlayer.canGoNext = false;
        mprisPlayer.canGoPrevious = false;
        mprisPlayer.canSeek = false;
    } catch(err) {
        '*poop* uh oh'
    }
}

ipc.on('playpause', (event, arg) => {
    resumeButton()
});
ipc.on("play", (event, arg) => {
    resumeButton();
});
ipc.on("next", (event, arg) => {
    nextSong();
})
ipc.on("previous", (event, arg) => {
    previousSong();
})
ipc.on("shuffle", (event, arg) => {
    enableShuffle();
})
ipc.on('repeat', (event, arg) => {
    enableRepeat();
});
ipc.on('preferences', () => {
    menuOpened = 'settings';
    navOpen();
});
let mpOpen = false;
ipc.on('toggle-mp', () => {
    if (mpOpen == false) {
        remote.getCurrentWindow().hide();
        ipc.send('switch-windows-mini');
        mpOpen = true;
    } else {
        ipc.send('shortcut-close');
        mpOpen = false;
    }
});

if (theme == 'light') {
    document.getElementById('songPicture').style.background = 'url(../assets/no_image_light.svg)';
    document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image_light.svg)';
}

if (process.platform === 'win32' || process.platform == 'linux') {
    if (settings.get('title-bar') == 'native') {
        customTitleBar();
    } else {
        $('.title-bar-wrapper').show();
        $('#openFileBrowser').show();
    }
}

function customTitleBar() {
    $('.title-bar').hide();
    $('.app-content').css({
        marginTop: '0'
    });
    $('.top-bar').css({
        top: '0'
    });
    $('#playType').css({
        paddingTop: '52px'
    });
    $('.shadow-hide').css({
        top: '0'
    });
    $('#songsPage').css({
        height: 'calc(100% - 138px)'
    });
    $('.menu').css({
        top: 0,
        height: '100%'
    });
    $('.play-type-wrapper').css({
        height: 'calc(100% - 169px)'
    });
    $('.logo-bottom').css({
        top: '6px'
    });
    $('.cover-top').css({
        top: '-20px'
    });
    $('.drag-border').css('height', 'calc(100% - 143px)');
    $('.artist-album-list').css('height', 'calc(100vh - 179px');
}

if (process.platform === 'darwin') {
    $('.title-bar').css({
        height: '20px'
    });
    $('.app-content').css({
        marginTop: '50px'
    });
    $('.top-bar').css({
        top: '20px'
    });
    $('#playType').css({
        paddingTop: '72px'
    });
    $('.shadow-hide').css({
        top: '20px'
    });
    $('#songsPage').css({
        height: 'calc(100% - 158px)'
    });
    $('.menu').css({
        top: '22px',
        height: 'calc(100% - 22px)'
    });
    $('.play-type-wrapper').css({
        height: 'calc(100% - 189px)'
    });
    $('.logo-bottom').css({
        top: '26px'
    });
    $('.cover-top').css({
        top: '-20px'
    });
}

//$('.list-wrapper').html('<p style="text-align: center; font-weight: bold; margin-left: 150px;">Loading...');

remote.getCurrentWindow().setMinimumSize(720, 525);
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());
document.querySelector('img').draggable = false;

function toolbarPlay() {
    remote.getCurrentWindow().setThumbarButtons([{
            tooltip: 'Previous',
            icon: path.join(__dirname, '../assets/skipprevious_white.png'),
            click() {
                previousSong();
            }
        },
        {
            tooltip: 'Play',
            icon: path.join(__dirname, '../assets/play_arrow_white.png'),
            click() {
                resumeButton();
            }
        },
        {
            tooltip: 'Skip',
            icon: path.join(__dirname, '../assets/skipnext_white.png'),
            click() {
                nextSong()
            }
        }
    ])
}

function toolbarPause() {
    remote.getCurrentWindow().setThumbarButtons([{
            tooltip: 'Previous',
            icon: path.join(__dirname, '../assets/skipprevious_white.png'),
            click() {
                previousSong()
            }
        },
        {
            tooltip: 'Pause',
            icon: path.join(__dirname, '../assets/pause_white.png'),
            click() {
                resumeButton();
            }
        },
        {
            tooltip: 'Skip',
            icon: path.join(__dirname, '../assets/skipnext_white.png'),
            click() {
                nextSong()
            }
        }
    ])
}
toolbarPlay();

function songActive() {
    if (currentScreenList.indexOf(newFileChosen) == -1) return songActiveReset();
    $(`#${highlightSong}`).addClass('song-active')
    $(`#${highlightSong} i`).addClass('song-opac');
    if (pauseButtonActive === false) {
        $(`#${highlightSong} i`).text('volume_up');
    } else {
        $(`#${highlightSong} i`).text('play_arrow');
    }
    shuffleWait = false;
}

function songActiveReset() {
    $('.play-pause').text('play_arrow');
    $(`.play-pause`).removeClass('song-opac')
    $('.results-link').removeClass('song-active');
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

$('body').on("contextmenu", "li.results-link", function (e) {
    $('.context-menu').show();
    ctxMenu = document.getElementById('contextMenu')
    if (e.pageX + ctxMenu.offsetWidth >= window.innerWidth) {
        xPosition = e.pageX - ctxMenu.offsetWidth;
    } else {
        xPosition = e.pageX;
    }
    if (e.pageY + ctxMenu.offsetHeight >= window.innerHeight) {
        yPosition = e.pageY - ctxMenu.offsetHeight;
    } else {
        yPosition = e.pageY;
    }
    clickedSong = e.currentTarget.id;
    $('.context-menu').css({
        left: xPosition + 'px',
        top: yPosition + 'px'
    });
    return false;
});
$('html').click(() => {
    $('.context-menu').hide();
})

let fileextentions = ['mp3', 'm4a', 'wav', 'ogg', '3gp', 'aac', 'flac', 'webm', 'raw']
let reloading;
let ctxMenu;
let xPosition;
let yPosition;
let playlistList = {};
let clickedSong;
let songMetadata = {};
let songData = {}
let tab = 'songs';
let directories = [`${os.homedir}/Music/Audiation`];
let touch = false;

function readdir(dir, cb) {
    fs.readdir(dir, function (err, files) {
        cb(err, files && files.map(join(dir)));
    });
};

function join(dir) {
    return function (file) {
        return path.join(dir, file);
    };
}

window.addEventListener('touchstart', () => {
    touch = true;
    $('li.results-link').addClass('nohover');
})

window.addEventListener('touchend', () => {
    setTimeout(() => {
        touch = false;
    },5)
})

function removeLoader() {
    $('#loadCover').css({
        opacity: 0
    });
    $('.main-content').css({
        transform: 'scale(1)'
    })
    setTimeout(function () {
        $('#loadCover').hide();
        document.body.style.cursor = 'default';
    }, 250);
}

let dragList = document.querySelector(".list-wrapper");
dragList.ondragover = () => {
    $('.drag-border').show();
}
dragList.ondragleave = () => {
    $('.drag-border').hide();
}

let dragFiles;
dragList.ondrop = (e) => {
    e.preventDefault();
    addFilesToLibrary(e.dataTransfer.files);
}

function addFilesToLibrary(e) {
    dragFiles = e;
    $('.drag-border').hide();
    let fileWkr = new Worker('./files.js');
    fileWkr.postMessage([dragFiles, songMetadata, app.getPath('userData')]);
    $('.sync-status').css('opacity', 1);
    $('.sync-status i').text('autorenew');
    let oneSong = 'files';
    if (dragFiles.length == 1) {
        oneSong = 'file'
    }
    $('#addMsg').text(`Importing ${dragFiles.length} ${oneSong} to library...`);
    $('.sync-status').addClass('visible');
    $('.sync-status i').addClass('spin');
    fileWkr.onmessage = function(e) {
        if (e.data == 0) {
            $('.sync-status i').text('cancel');
            $('#addMsg').text('No songs were imported');
            console.log(`No audio files were imported`);
        } else {
            let oneSong = 'songs';
            if (e.data == 1) {
                oneSong = 'song'
            }    
            $('.sync-status i').text('done');
            $('#addMsg').text(`Imported ${e.data} ${oneSong}!`);
            console.log(`Imported ${e.data} ${oneSong}`);
            listFiles('FTREGULAR');
        }
        fileWkr.terminate();
        $('.sync-status i').removeClass('spin');
        setTimeout(() => {
            $('.sync-status').css('opacity', 0);
            setTimeout(() => {
                $('.sync-status').removeClass('visible');
            }, 250)
        }, 2000);
    }
}

$('#deleteFromLibrary').click(() => {
    delete songMetadata[allFilesList[clickedSong]];
    fs.writeJsonSync(`${app.getPath('userData')}/library.json`, songMetadata);
    listFiles('FTREGULAR');
})

let newList;
let list;
let working = false;
let currentScreenList;

function listFiles(g) {
    reloading = false;
    s = [];
    currentScreenList = [];
    if (g == 'FTREGULAR') {
        keepSongList = [];
        tabTitle = 'All Songs';
        $('#albumArtistBack').css('visibility', 'hidden');
    }
    new Promise(() => {
        if (!fs.existsSync(`${app.getPath('userData')}/library.json`)) {
            iconStyleSelect(settings.get('icon-style'))
            removeLoader();
            reloading = false;
            //return $('.list-wrapper').html(`<p style="font-weight: bold; margin-left: 215px;">Please drag some files here.`);
        } else {
            new Promise((resolve) => {
                fs.readJson(`${app.getPath('userData')}/library.json`, (err, file) => {
                    if (file.length <= 10) {
                        iconStyleSelect(settings.get('icon-style'))
                        removeLoader();
                        fs.unlink(`${app.getPath('userData')}/library.json`, (err) => {
                            if (err) throw err;
                        });
                        reloading = false;
                    }
                    songMetadata = file;
                    list = Object.entries(file).map(e => [e[0]])
                    newList = [];
                    list.forEach((f, i) => {
                        newList.push(list[i][0]);
                    })
                    resolve(newList)
                });
            }).then((a) => {
                a.sort(function (x, b) {
                    if (process.platform == 'win32') {
                        x = x.substr(x.lastIndexOf('\\') + 1);
                        b = b.substr(b.lastIndexOf('\\') + 1);
                    } else {
                        x = x.substr(x.lastIndexOf('/') + 1);
                        b = b.substr(b.lastIndexOf('/') + 1);
                    }
                    if (x.toLowerCase() < b.toLowerCase()) return -1;
                    if (x.toLowerCase() > b.toLowerCase()) return 1;
                    return 0;
                });
                //$('.list-wrapper').html('');
                a.forEach((f, i) => {
                    forEachFile(f, i, g);
                });
                let ifSongOne = 'Songs';
                if (allFilesList.length == 1) {
                    ifSongOne = 'Song';
                }
                $('#songCountNum').text(`${allFilesList.length} ${ifSongOne}`);
                $('.tab-title h2').text(tabTitle);
                $('#songsPage').css('visibility', 'visible');
                firstrun = false;
                if (settings.get('sidemenu') == true) {
                    $('#playType, li.results-link').addClass('closed');
                }
                let searchSongs;
                /* if (currentlyPlaying === true) {
                    searchSongs = currentScreenList.indexOf(newFileChosen);
                    if (searchSongs != -1) {
                        highlightSong = searchSongs;
                        currentSongPlaying = searchSongs;
                        songActive()
                    } else {
                        highlightSong = null;
                        currentSongPlaying = null;
                        if (currentTab == 'songs') {
                            noSong = true;
                            console.log('nosong')
                        }
                    }
                } */
                iconStyleSelect(settings.get('icon-style'))
                removeLoader();
                countNum = 0;
            })
        }
    })
}

let countNum = 0;

function forEachFile(f, i, a) {
    let simNum = countNum;
    function playSong(e) {
        allFilesList = [];
        shuffleOrder = [];
        fileSongListStore = [];
        shuffleList = [];
        let tempKeepSongs = [];
        currentScreenList.forEach(f => {
            tempKeepSongs.push(f);
        })
        shuffleOrder = shuffle(currentScreenList);
        allFilesList = tempKeepSongs;
        fileSongListStore = tempKeepSongs;
        currentScreenList = tempKeepSongs;
        shuffleOrder.forEach((f, i) => {
            shuffleList.push(currentScreenList.indexOf(f));
        });
        currentSongPlaying = simNum;
        highlightSong = simNum;
        songActiveReset();
        newFileChosen = f;
        newFileName = f.slice(0, -fName[fName.length - 1].length - 1);
        if (process.platform == 'win32') {
            newFileName = newFileName.substr(newFileName.lastIndexOf('\\') + 1);
        } else {
            newFileName = newFileName.substr(newFileName.lastIndexOf('/') + 1);
        }
        fs.exists(newFileChosen, (exists) => {
            if (exists == false) {
                $('.err-container').css('bottom', '0px');
                setTimeout(() => {
                    $('.err-container').css('bottom', '');
                }, 3000);
                audioStop();
            } else {
                if (currentlyPlaying === true) {
                    audioStop();
                }
                $('#pauseButton').text('pause')
                if (e == false) {
                    findSong(false);
                } else {
                    findSong();
                }
                songActive();
            }
        })
    }
    let songInfo = songMetadata[f];
    let artist = songInfo.artist;
    let album = songInfo.album;
    if (a == 'FTREGULAR' || artist == a || album == a) {
        /* fileSongListStore.push(f);
        allFilesList.push(f); */
        currentScreenList.push(f);
        if (a == 'FTREGULAR') {
            keepSongList.push(f);
        }
        fName = f.split('.');
        fileName = f.slice(0, -fName[fName.length - 1].length - 1);
        if (process.platform == 'win32') {
            fileName = fileName.substr(fileName.lastIndexOf('\\') + 1);
        } else {
            fileName = fileName.substr(fileName.lastIndexOf('/') + 1);
        }
        let title = songInfo.title;
        if (!artist) {
            artist = 'Unknown Artist';
        }
        if (!title) {
            title = fileName;
        }
        if (!album) {
            album = 'Unknown Album';
        }
        $(`#${tab}Page .list-wrapper`).append(`<li draggable="true" class="results-link" id="${simNum}"><i class="material-icons play-pause" style="opacity: 0;">play_arrow</i>`);
        $(`#${tab}Page .list-wrapper #${simNum}`).append(`<div class="artist-title-album"><p class="list-title">${title}</p><p class="list-artist">${artist}</p><p class="list-album">${album}</p>`)
        $(`#${simNum} p`).dblclick(function () {
            if (touch) return; 
            shuffleCheck = false;
            if (shuffleEnabled == true) {
                shuffleCheck = true;
                shuffleEnableFirst = true;
            }
            playSong();
        });
        $(`#${simNum} p`).click(function () {
            if (!touch) return; 
            shuffleCheck = false;
            if (shuffleEnabled == true) {
                shuffleCheck = true;
                shuffleEnableFirst = true;
            }
            playSong();
        });
        $(`#${simNum} i`).click(function () {
            shuffleCheck = false;
            if (shuffleEnabled == true) {
                shuffleCheck = true;
                shuffleEnableFirst = true;
            }
            if (currentlyPlaying === true && $(`#${simNum}`).attr('id') === `#${highlightSong}`.substr(1)) {
                resumeButton();
            } else {
                playSong()
                $(`#${simNum} i`).text('pause');
            }
        })
        $(`#${simNum}`).mouseover(function () {
            $(`#${simNum} i`).addClass('song-opac')
        })
        $(`#${simNum} i`).mouseover(function () {
            if (highlightSong == simNum && pauseButtonActive == false) {
                $(`#${simNum} i`).text('pause');
            }
        })
        $(`#${simNum}`).mouseleave(function () {
            if (highlightSong !== simNum) {
                $(`#${simNum} i`).removeClass('song-opac')
                $(`#${simNum} i`).text('play_arrow');
            }
        })
        $(`#${simNum} i`).mouseleave(function () {
            if (highlightSong == simNum) {
                $(`#${simNum} i`).addClass('song-opac');
                if (pauseButtonActive == false) {
                    $(`#${simNum} i`).text('volume_up')
                }
            }
        })
        document.getElementById(simNum).ondragstart = (event) => {
            event.preventDefault()
            ipc.send('ondragstart', null);
        }
        if (firstrun == true) {
            if (settings.get('last-song') == f) {
                runonce = true;
                playSong(false);
            }
        }
        countNum++;
    }
}

listFiles('FTREGULAR');

let addSong;
$('#addSongPlaylist').click(() => {
    addSong = fileSongListStore[clickedSong];
    if (playlistList.indexOf(addSong) != -1) return;
    playlistList.push(addSong);
    fs.writeJson(`${app.getPath('userData')}/playlists.json`, ({
        'playlist1': playlistList
    }), err => {
        if (err) return console.error(err)
    });
})

$('#refreshFiles').click(function () {
    if (reloading == false) {
        $('#loadCover').show();
        $('#loadCover').css({
            opacity: 1
        });
        reloading = true
        setTimeout(loadFiles, 50)
    }
});

let waitSpam;
let lastPlayedSong = 0;

function previousSong() {
    if (waitSpam == true) return;
    waitSpam = true;
    setTimeout(() => {
        waitSpam = false;
    }, 250);
    if (noSong == true) {
        currentSongPlaying = 0;
        highlightSong = 0;
        noSong = false;
    }
    shuffleCheck = false;
    if (currentlyPlaying == true) {
        audioStop();
        songActiveReset();
    }
    if (shuffleEnabled === true) {
        allFilesList = shuffleOrder;
        checkForShuffle = true;
    } else {
        allFilesList = fileSongListStore;
        checkForShuffle = false;
    }
    currentSongPlaying = currentSongPlaying - 1;
    if (currentSongPlaying == -1 || currentlyPlaying == false) {
        currentSongPlaying = allFilesList.length - 1;
    }
    if (shuffleEnableFirst === true) {
        currentSongPlaying = shuffleList.indexOf(highlightSong) - 1;
        shuffleEnableFirst = false;
    }
    if (shuffleDisableFirst === true) {
        currentSongPlaying = highlightSong - 1;
        shuffleDisableFirst = false;
    }
    newFileChosen = allFilesList[currentSongPlaying];
    newFileName = newFileChosen.slice(0, -fName[fName.length - 1].length - 1);
    if (process.platform == 'win32') {
        newFileName = newFileName.substr(newFileName.lastIndexOf('\\') + 1);
    } else {
        newFileName = newFileName.substr(newFileName.lastIndexOf('/') + 1);
    }
    fs.exists(newFileChosen, (exists) => {
        if (exists == false) {
            $('.err-container').css('bottom', '0px');
            setTimeout(() => {
                $('.err-container').css('bottom', '');
            }, 3000);
            audioStop();
        } else {
            if (shuffleEnabled == true) {
                highlightSong = shuffleList[currentSongPlaying];
            } else {
                highlightSong = currentSongPlaying;
            }
            $(`#${highlightSong} i`).text('volume_up');
            $('#pauseButton').text('pause')
            songActive();
            findSong();
            ipc.send('play-mini')
        }
    });
}

function nextSong() {
    if (waitSpam == true) return;
    waitSpam = true;
    setTimeout(() => {
        waitSpam = false;
    }, 250);
    shuffleCheck = false;
    if (currentlyPlaying === true) {
        audioStop();
        songActiveReset();
    }
    if (shuffleEnabled === true) {
        allFilesList = shuffleOrder;
        checkForShuffle = true;
    } else {
        allFilesList = fileSongListStore;
        checkForShuffle = false;
    }
    currentSongPlaying = ++currentSongPlaying;
    if (currentSongPlaying == allFilesList.length) {
        currentSongPlaying = 0;
    }
    if (currentlyPlaying === false) {
        currentSongPlaying = 0;
    }
    if (shuffleEnableFirst === true) {
        currentSongPlaying = shuffleList.indexOf(highlightSong) + 1;
        shuffleEnableFirst = false;
    }
    if (shuffleDisableFirst === true) {
        currentSongPlaying = highlightSong + 1;
        shuffleDisableFirst = false;
    }
    newFileChosen = allFilesList[currentSongPlaying];
    newFileName = newFileChosen.slice(0, -fName[fName.length - 1].length - 1);
    if (process.platform == 'win32') {
        newFileName = newFileName.substr(newFileName.lastIndexOf('\\') + 1);
    } else {
        newFileName = newFileName.substr(newFileName.lastIndexOf('/') + 1);
    }
    fs.exists(newFileChosen, (exists) => {
        if (exists == false) {
            $('.err-container').css('bottom', '0px');
            setTimeout(() => {
                $('.err-container').css('bottom', '');
            }, 3000);
            audioStop();
        } else {
            if (shuffleEnabled == true) {
                highlightSong = shuffleList[currentSongPlaying];
            } else {
                highlightSong = currentSongPlaying;
            }
            if (noSong == true) {
                currentSongPlaying = 0;
                highlightSong = 0;
                newFileChosen = allFilesList[currentSongPlaying];
                newFileName = newFileChosen.slice(0, -fName[fName.length - 1].length - 1);
                if (process.platform == 'win32') {
                    newFileName = newFileName.substr(newFileName.lastIndexOf('\\') + 1);
                } else {
                    newFileName = newFileName.substr(newFileName.lastIndexOf('/') + 1);
                }
                noSong = false;
            }
            $(`#${highlightSong} i`).text('volume_up');
            $('#pauseButton').text('pause')
            songActive();
            findSong();
            ipc.send('play-mini')
        }
    });
}

$('#backwardButton').click(function () {
    if (currentSongPlaying === allFilesList[0]) {
        audioStop();
    } else {
        previousSong();
    }
})

$('#forwardButton').click(function () {
    if (currentSongPlaying === allFilesList.length) {
        audioStop();
    } else {
        nextSong();
    }
});

function enableShuffle() {
    switch (shuffleEnabled) {
        case true:
            shuffleEnabled = false;
            $('#shuffleButton').css({
                color: 'var(--text)',
                'text-shadow': 'none'
            });
            shuffleWait = true;
            shuffleEnableFirst = false;
            shuffleDisableFirst = true;
            break;
        case false:
            shuffleEnabled = true;
            $('#shuffleButton').css({
                color: 'var(--hl-txt)',
                'text-shadow': '0px 2px 15px var(--glow)'
            });
            shuffleWait = true;
            shuffleEnableFirst = true;
            shuffleDisableFirst = false;
    }
    ipc.send('shuffle-enable')
}

function enableRepeat() {
    switch (repeatEnabled) {
        case true:
            repeatEnabled = false;
            $('#repeatButton').css({
                color: 'var(--text)',
                'text-shadow': 'none'
            });
            break;
        case false:
            repeatEnabled = true;
            $('#repeatButton').css({
                color: 'var(--hl-txt)',
                'text-shadow': '0px 2px 15px var(--glow)'
            });
            shuffleEnableFirst = false;
    }
    ipc.send('repeat-enable')
}

$('#repeatButton').click(function () {
    enableRepeat()
});

$('#shuffleButton').click(function () {
    enableShuffle()
})

$('.tb-close').click(function () {
    window.close();
});

$('.tb-close').mouseover(() => {
    $('#TitleBarClose polygon').css({
        fill: '#fff'
    })
})

$('.tb-close').mouseleave(() => {
    $('#TitleBarClose polygon').css({
        fill: ''
    })
})

$('.tb-maximize').click(function () {
    let window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
});

function maximizeWindow() {
    let window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        $('.tb-unmaximize').hide()
        $('.tb-ismaximize').show();
        $('#noDrag').show();
    } else {
        $('.tb-unmaximize').show()
        $('.tb-ismaximize').hide();
        $('#noDrag').hide();
    }
}

maximizeWindow();

ipc.on('maximizeWindow', () => {
    maximizeWindow();
})

ipc.on('unmaximizeWindow', () => {
    maximizeWindow();
})

window.addEventListener('blur', () => {
    if (theme == 'light') {
        $('.title-bar').css({
            background: '#f5f5f5'
        });
    } else if (theme == 'dark') {
        $('.title-bar').css({
            background: '#222222'
        });
    } else if (theme == 'black') {
        $('.title-bar').css({
            background: '#0f0f0f'
        });
    }
    $('.tb-button').css({
        opacity: .5
    })
    $(document).click();
})

window.addEventListener('focus', () => {
    if (theme == 'light') {
        $('.title-bar').css({
            background: '#ffffff'
        });
    } else if (theme == 'dark') {
        $('.title-bar').css({
            background: '#1e1e1e'
        });
    } else if (theme == 'black') {
        $('.title-bar').css({
            background: '#030303'
        });
    }
    $('.tb-button').css({
        opacity: 1
    })
})

$('.tb-minimize').click(function () {
    let window = remote.getCurrentWindow();
    window.minimize();
})

window.onkeydown = function (e) {
    return !(e.keyCode == 32);
};

document.addEventListener("keydown", function (e) {
    switch (e.which) {
        case 82:
            if (e.ctrlKey == true) {
                reload = true;
            }
            break;
        case 32:
            if (currentlyPlaying) {
                resumeButton();
            }
            break;
        case 37:
            audio.currentTime = audio.currentTime - 5;
            break;
            /* case 38:
                if (audio.volume >= 1) return;
                let volLengthUp = parseFloat(volFillBar.style.width.substr(0, volFillBar.style.width.length - 1));
                console.log(volLengthUp);
                volFillBar.style.width = volLengthUp + 10 + '%';
                audio.volume = audio.volume + 0.1;
                currentVol = audio.volume;
                break; */
        case 39:
            audio.currentTime = audio.currentTime + 5;
            break;
            /* case 40:
                if (audio.volume <= 0) return;
                let volLengthDown = parseFloat(volFillBar.style.width.substr(0, volFillBar.style.width.length - 1));
                volFillBar.style.width = volLengthDown - 10 + '%';
                audio.volume = audio.volume - 0.1;
                currentVol = audio.volume;
                break; */
    }
});

function noSongPlaying() {
    if (currentlyPlaying === false) {
        $('#songTitle, div.seek-bar, #songDuration').addClass('not-playing');
        $('#stopButton, .resume-button').addClass('button-active');
    } else {
        $('#songTitle, div.seek-bar, #songDuration').removeClass('not-playing');
        $('#stopButton, .resume-button').removeClass('button-active');
    }
}

noSongPlaying();

function restartMenuSwitch() {
    $('.restart-container').css('bottom', '-55px')
    setTimeout(() => {
        restartMessageCompact();
        $('.restart-container').css('bottom', 0)
    }, 200)
}

$('#closeSidemenu').click(() => {
    if (settings.get('sidemenu') == false) {
        $('#playType, li.results-link').addClass('closed');
        settings.set('sidemenu', true);
    } else {
        $('#playType, li.results-link').removeClass('closed');
        settings.set('sidemenu', false);
    }
})

let getSettings;
let generalSettings;
let appearanceSettings;
let aboutSettings;
let changelogSettings;
let opensourceSettings;
let advancedSettings;
let librarySettings;
let settingsMenu;
let subMenuList
let linkBack
let menuTitle
let settingsPage
let selectOptions;
let settingsListGet = {};

fs.readJSON(path.join(__dirname, './settingsconfig.json'), (err, file) => {
    getSettings = file;
    settingsMenu = getSettings.settingsMenu;
    generalSettings = getSettings.generalSettings;
    appearanceSettings = getSettings.appearanceSettings;
    aboutSettings = getSettings.aboutSettings;
    aboutSettings[0].controls[0].customHTML = `<div class="about-firetail"><img draggable="false" src="../assets/icon.png"><div class="about-name"><div class="name-ver"><h2>Firetail</h2><div class="about-ver">${ver}</div></div><div class="about-others"><div>Copyright &copy; projsh_ 2019</div><div>This project is under the terms of the GNU General Public Licence (v.3.0)`
    changelogSettings = getSettings.changelogSettings;
    opensourceSettings = getSettings.opensourceSettings;
    advancedSettings = getSettings.advancedSettings;
    librarySettings = getSettings.librarySettings;
    subMenuList = {
        'appearanceSubButton': 'appearanceSubmenu',
        'aboutSubButton': 'aboutSubmenu',
        'generalSubButton': 'generalSubmenu',
        'changelogSubButton': 'changelogSubmenu',
        'opensourceSubButton': 'opensourceSubmenu',
        'advancedSubButton': 'advancedSubmenu',
        'librarySubButton': 'librarySubmenu'
    }
    linkBack = {
        'appearanceSubmenu': 'menuMain',
        'aboutSubmenu': 'menuMain',
        'generalSubmenu': 'menuMain',
        'changelogSubmenu': 'aboutSubmenu',
        'opensourceSubmenu': 'aboutSubmenu',
        'advancedSubmenu': 'generalSubmenu',
        'librarySubmenu': 'generalSubmenu'
    }
    menuTitle = {
        'menuMain': 'Settings',
        'appearanceSubmenu': 'Appearance',
        'aboutSubmenu': 'About',
        'generalSubmenu': 'General',
        'changelogSubmenu': 'Changelog',
        'opensourceSubmenu': 'OSS & Credits',
        'advancedSubmenu': 'Advanced',
        'librarySubmenu': 'Library'
    }
    settingsPage = {
        'appearanceSubButton': appearanceSettings,
        'aboutSubButton': aboutSettings,
        'generalSubButton': generalSettings,
        'changelogSubButton': changelogSettings,
        'opensourceSubButton': opensourceSettings,
        'advancedSubButton': advancedSettings,
        'librarySubButton': librarySettings
    }
    selectOptions = {
        'iconStyleSelect': 'icon-style',
        'colouraccentSelect': 'colour-accent',
        'themeSelect': 'theme'
    }
});

$('.menu-bg').click(() => {
    navClose();
    setTimeout(() => {
        $(`.menu-heading, .menu-arrow, .submenu-title, .mtitle-button`).removeClass('hidden');
        $('.menu-list').removeClass('left');
        $('.menu-list').addClass('right');
        $('#menuMain').removeClass('right');
        $('.menu-heading.main').text('Settings');
        activeMenu = 'menuMain';
        getSubId = 'menuMain';
    }, 250);
})

let switches = [];
let options = [];
let id;
let optionInfo;
let topElement;

function createSettingsMenu(e, o) {
    switches = [];
    options = [];
    new Promise((resolve) => {
        let selectNames = Object.entries(selectOptions).map(e => [e[0]]);
        for (let i = 0; i < Object.keys(selectOptions).length; i++) {
            settingsListGet[selectOptions[selectNames[i]]] = settings.get(selectOptions[selectNames[i]]);
        }
        let settingsGenerate = new Worker('./settingspage.js');
        settingsGenerate.postMessage([e, o, settings.get('icon-style'), selectOptions, settingsListGet]);
        settingsGenerate.onmessage = function(g) {
            if (g.data[2] == true) {
                $(`#menuMain`).append(g.data[0]);
            } else {
                $(`#${getSubId}`).append(g.data[0]);
            }
            switches = g.data[1];
            resolve(e);
            settingsGenerate.terminate();
        }
    }).then((e) => {
        $('.menu-submenu-button').click(function () {
            if (transition == true) return;
            transition = true;
            getSubId = $(this).attr('id');
            if (subMenuList[getSubId] == activeMenu) return;
            getSubId = subMenuList[getSubId];
            $('.menu-controls').append(`<div class="menu-list main right" id="${getSubId}"></div>`);
            let getMenu = settingsPage[$(this).attr('id')];
            setTimeout(() => {
                createSettingsMenu(getMenu)
                findMenu('next');
            }, 15)
        });
        if (e[0].info.title == 'Changelog' || e[0].info.title == 'OSS \& Credits') {
            let mdfile;
            if (e[0].info.title == 'Changelog') mdfile = 'changelog';
            if (e[0].info.title == 'OSS & Credits') mdfile = 'ossoftware';
            fs.readFile(`${app.getAppPath()}/assets/${mdfile}.md`, "UTF8", (err, data) => {
                if (err) {
                    throw err
                };
                let result = md.render(data);
                $(`#${mdfile}`).append(result);
            });
        }
        if (e[0].info.title == 'Advanced') {
            $('#cssFile').change((e) => {
                let fileLocation = document.querySelector('#cssFile').files[0].path;
                settings.set('css-file', fileLocation);
                $('#customCSS').attr('href', fileLocation);
            });
            $('#clearCSS').click(() => {
                settings.set('css-file', '');
                $('#customCSS').attr('href', '');
            })
        }
        if (e[0].info.title == 'Library') {
            $('#libraryFile').change((e) => {
                addFilesToLibrary(e.target.files);
            })
        }
        if (settings.get('mini-player-bg') == false) {
            $('#miniBgToggle').prop('checked', false)
        } else {
            $('#miniBgToggle').prop('checked', true)
        }
        if (settings.get('discordrpc') == true) {
            $('#discordToggle').prop('checked', true);
        }
        if (settings.get('title-bar') == 'native') {
            $('#nativeToggle').prop('checked', true);
        }
        switches.forEach((f, i) => {
            $(`#${f}`).click(() => {
                window[f]();
            })
        });
        //thanks: https://codepen.io/wallaceerick/pen/ctsCz
        $('select').each(function () {
            let $this = $(this),
                numberOfOptions = $(this).children('option').length;
            $this.addClass('select-hidden');
            $this.wrap('<div class="select"></div>');
            $this.after('<div class="select-styled"></div>');
            let $styledSelect = $this.next('div.select-styled');
            $styledSelect.text($this.children('option').eq(0).text());
            let $list = $('<ul />', {
                'class': 'select-options'
            }).insertAfter($styledSelect);
            for (let i = 0; i < numberOfOptions; i++) {
                if ($this.children('option').eq(i).attr('selected')) {
                    $styledSelect.text($this.children('option').eq(i).text());
                }
                $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);
            }
            let $listItems = $list.children('li');
            $styledSelect.click(function (a) {
                $('.disable-interact').show();
                a.stopPropagation();
                $('div.select-styled.active').not(this).each(() => {
                    $(this).removeClass('active').next('ul.select-options').hide();
                });
                $(this).toggleClass('active').next('ul.select-options').toggle();
                let menuList = document.getElementById(activeMenu);
                let parent = $(this).parents().eq(2);
                parent = parent.attr('id');
                parent = document.getElementById(parent);
                if (parent.getBoundingClientRect().top - menuList.getBoundingClientRect().top + parent.clientHeight >= menuList.clientHeight) {
                    menuList.scrollTop = parent.scrollHeight;
                };
                topElement = this.parentElement.getBoundingClientRect().top;
                $('.select-options').css('top', `${topElement + 30}px`);
            });
            $listItems.click(function (e) {
                e.stopPropagation();
                $styledSelect.text($(this).text()).removeClass('active');
                $this.val($(this).attr('rel'));
                $('.disable-interact').hide();
                $list.hide();
                window[$this.attr('id')]($this.val());
            });
            $(document).click(function () {
                $styledSelect.removeClass('active');
                $('.disable-interact').hide();
                $list.hide();
            });
            $(window).on('resize', () => {
                $(document).click();
            })
        });
    });
}

let menuOpened;

function iconStyleSelect(i) {
    switch (i) {
        case "filled":
            $('.material-icons').removeClass('material-icons-rounded');
            $('.material-icons').removeClass('material-icons-outlined');
            break;
        case "rounded":
            $('.material-icons').addClass('material-icons-rounded');
            $('.material-icons').removeClass('material-icons-outlined');
            break;
        case "outlined":
            $('.material-icons').addClass('material-icons-outlined');
            $('.material-icons').removeClass('material-icons-rounded');
    }
    settings.set('icon-style', `${i}`);
    ipc.send('setting-change', ['icon-style', i])
}

function colouraccentSelect(i) {
    $('html').attr('class', `${theme} ${i}`);
    settings.set('colour-accent', i)
    ipc.send('setting-change', ['colour-accent', i])
}

function navOpen() {
    menuOpen = true;
    createSettingsMenu(settingsMenu, 1);
    if (restartRequired == true) {
        restartMenuSwitch();
    }
    $(`#${menuOpened}Menu`).show();
    setTimeout(() => {
        $(`#${menuOpened}Menu`).css({
            opacity: 1
        })
    }, 1);
}

function navClose() {
    menuOpen = false;
    if (restartRequired == true) {
        restartMenuSwitch();
    }
    $('#effectsMenu, #settingsMenu').css({
        opacity: 0
    })
    setTimeout(() => {
        $('#effectsMenu, #settingsMenu').hide();
        $('#settingsMenu .menu-controls').html('<div class="disable-interact"></div><div class="menu-list main" id="menuMain"></div>')
    }, 250);
}

$('#effectsButton, #settingsButton').click(function () {
    menuOpened = this.id.substr(0, this.id.length - 6);
    navOpen();
})

$('#effectsClose, #settingsClose').click(function () {
    navClose();
    setTimeout(() => {
        $(`.menu-heading, .menu-arrow, .submenu-title, .mtitle-button`).removeClass('hidden');
        $('.menu-list').removeClass('left');
        $('.menu-list').addClass('right');
        $('#menuMain').removeClass('right');
        $('.menu-heading.main').text('Settings');
        activeMenu = 'menuMain';
        getSubId = 'menuMain';
    }, 250);
});

let restartRequired = false;

function themeSelect(i) {
    theme = i;
    $('html').attr('class', `${i} ${settings.get('colour-accent')}`);
    settings.set('theme', i);
    if (theme == 'light') {
        $('.title-bar').css({
            background: '#ffffff'
        });
    } else if (theme == 'dark') {
        $('.title-bar').css({
            background: '#1e1e1e'
        });
    } else if (theme == 'black') {
        $('.title-bar').css({
            background: '#030303'
        });
    }
    bgImage = $('#songPicture').css('background-image');
    if (theme == 'light' && bgImage.includes('no_image')) {
        $('#songPicture, #songPictureBlur').css('background-image', 'url(../assets/no_image_light.svg)');
    } else if (bgImage.includes('no_image')) {
        $('#songPicture, #songPictureBlur').css('background-image', 'url(../assets/no_image.svg)');
    }
    ipc.send('setting-change', ['theme', i])
}

function discordToggle() {
    if (settings.get('discordrpc') == true) {
        settings.set('discordrpc', false)
    } else {
        settings.set('discordrpc', true)
    }
    $('.restart-container').css('bottom', 0);
    restartRequired = true;
};

function audioEffectsToggle() {
    if (settings.get('audio-effects') == true) {
        settings.set('audio-effects', false);
        $('#effectsButton').hide();
    } else {
        settings.set('audio-effects', true);
        $('#effectsButton').show();
    }
}

function miniBgToggle() {
    if (settings.get('mini-player-bg') == true) {
        settings.set('mini-player-bg', false);
        ipc.send('setting-change', ['mini-bg', false])
    } else {
        settings.set('mini-player-bg', true);
        ipc.send('setting-change', ['mini-bg', true])
    }
}

function nativeToggle() {
    if (settings.get('title-bar') == 'custom') {
        settings.set('title-bar', 'native')
    } else {
        settings.set('title-bar', 'custom')
    }
    $('.restart-container').css('bottom', 0);
    restartRequired = true;
}

function resetLibrary() {
    fs.unlink(`${app.getPath('userData')}/library.json`, (err) => {
        if (err) throw err;
        songMetadata = {};
        listFiles('FTREGULAR');
    });
}

let activeMenu = 'menuMain';
let transition = false;

let getSubId;
let previousMenu;

function findMenu(i) {
    switch (i) {
        case "next":
            $(`#${activeMenu}`).addClass('left');
            if (activeMenu == 'menuMain') {
                $(`.menu-heading, .menu-arrow, .submenu-title, .mtitle-button`).addClass('hidden');
                $('.submenu-title').text(`${menuTitle[getSubId]}`);
                setTimeout(() => {
                    transition = false;
                }, 250)
            } else {
                $('.menu-heading.main').text(menuTitle[activeMenu]);
                $('.submenu-title').text(menuTitle[getSubId]);
                setTimeout(() => {
                    transition = false;
                }, 250)
            }
            activeMenu = getSubId;
            $(`#${activeMenu}`).removeClass('right');
            break;
        case "previous":
            $(`#${activeMenu}`).addClass('right');
            setTimeout(() => {
                $(`#${previousMenu}`).remove();
                transition = false;
            }, 250);
            activeMenu = getSubId;
            $(`#${activeMenu}`).removeClass('left');
            break;
    }
}

$('.mtitle-button').click(() => {
    if (!linkBack[activeMenu]) return;
    if (transition == true) return;
    transition = true;
    previousMenu = activeMenu;
    $(`#${previousMenu} div.menu-submenu-button`).off('click');
    if (linkBack[activeMenu] == 'menuMain') {
        $(`.menu-heading, .menu-arrow, .submenu-title, .mtitle-button`).removeClass('hidden');
        setTimeout(() => {
            transition = false;
        }, 250)
    }
    getSubId = linkBack[activeMenu];
    $('.menu-heading.main').text(menuTitle[linkBack[getSubId]]);
    $('.submenu-title').text(menuTitle[getSubId])
    findMenu('previous')
})

function restartMessageCompact() {
    if (menuOpen == false) {
        $('.restart-container, .restart-label').addClass('rs-compact');
    } else {
        $('.restart-container, .restart-label').removeClass('rs-compact');
    }
}

$('.restart-button').click(() => {
    setTimeout(() => {
        app.relaunch();
        if (process.platform == 'linux') {
            appExit();
        } else {
            setTimeout(() => {
                settings.set('last-song-time', audio.currentTime);
                app.exit();
            }, 10)
        }
    }, 500);
})

$('#miniPlayerButton').click(() => {
    remote.getCurrentWindow().hide();
    ipc.send('switch-windows-mini')
})

ipc.on('switch-windows', () => {
    remote.getCurrentWindow().show();
})

function audioStop() {
    songActiveReset();
    audio.pause();
    audio.currentTime = 0;
    noSongPlaying();
    $('div.playing-now').removeClass('playing-now-active');
    $('div.play-button, select, div.play-type').show();
    pauseButtonActive = false;
}
let firstPlay = true;
let source;

function findSong(e) {
    try {
        if (audio) {
            audio.removeEventListener('timeupdate', seekTimeUpdate);
        }
        $('.new-nowplaying').addClass('np-active');
        $('#songPictureBlur').show();
        $('#songPicture').removeClass('song-picture-decrease');
        $('#songPictureBlur').removeClass('song-blur-hidden');
        currentlyPlaying = true;
        ipc.send('is-playing', currentlyPlaying)
        noSongPlaying();
        try {
            if (firstPlay == true) {
                firstPlay = false;
                audio = new Audio(newFileChosen);
                source = audioCtx.createMediaElementSource(audio);
                gain = audioCtx.createGain();
                source.connect(gain).connect(audioCtx.destination)
            } else {
                audio.src = newFileChosen
            }
            audio.currentTime = 0;
            audio.play();
            if (process.platform == 'win32') {
                Controls.playbackStatus = MediaPlaybackStatus.playing;
            }
            if (e == false) {
                resumeButton();
            }
            settings.set('last-song', newFileChosen)
            if (process.platform == 'linux') {
                try {
                    mprisPlayer.canPlay = true;
                    mprisPlayer.canPause = true;
                    mprisPlayer.canControl = true;
                    mprisPlayer.canGoNext = true;
                    mprisPlayer.canGoPrevious = true;
                    mprisPlayer.canSeek = true;
                } catch(err) {
                    'stinky'
                }
            }
        } catch (err) {
            throw err;
        }
        getSongInfo();
        audio.volume = currentVol;
        seekBarTrack();
        toolbarPause();
        settings.set('last-song-time', 0);
    } catch (err) {
        throw err;
    }
}

let img;
let tagInfo;
let readingNewSong = false;

let albumImg = new Worker('./albumart.js');

function getSongInfo() {
    if (process.platform == 'linux') clearTempFiles();
    if (theme == 'light') {
        document.getElementById('songPicture').style.background = 'url(../assets/no_image_light.svg)';
        document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image_light.svg)';
    } else {
        document.getElementById('songPicture').style.background = 'url(../assets/no_image.svg)';
        document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image.svg)';
    }
    let metadata = songMetadata[newFileChosen];
    Title = metadata.title;
    album = metadata.album;
    artist = metadata.artist;
    if (Title == undefined) Title = newFileName;
    if (album == undefined) album = 'Unknown Album';
    if (artist == undefined) artist = 'Unknown Artist';
    $('h1#songTitle').text(Title);
    $('#artist').text(`${artist}`);
    if (artist == 'Unknown Artist') {
        $('title').text(`${newFileName}`);
    } else {
        $('title').text(`${artist} - ${Title}`)
    }
    if (theme == 'light') {
        dataUrl = '../../assets/no_image_light.svg'
    } else {
        dataUrl = '../../assets/no_image.svg'
    }
    tagInfo = {
        'title': Title,
        'artist': artist,
        'album': album,
        'art': dataUrl
    }
    if (process.platform == 'win32') {
        Controls.displayUpdater.musicProperties.title = Title;
        Controls.displayUpdater.musicProperties.artist = artist;
        Controls.displayUpdater.musicProperties.albumTitle = album;
        Controls.displayUpdater.update();
    }
    ipc.send('tag-info', tagInfo)
    albumImg.postMessage([newFileChosen, tmpobj.name, app.getPath('userData')]);
    albumImg.onmessage = function (e) {
        if (readingNewSong == true) return;
        readingNewSong = true;
        img = e.data;
        if (img == null) {
            if (theme == 'light') {
                document.getElementById('songPicture').style.background = 'url(../assets/no_image_light.svg)';
                document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image_light.svg)';
                albumArt = '../assets/no_image_light.svg';
                dataUrl = '../../assets/no_image_light.svg';
                img = `${app.getAppPath()}/assets/no_image_light.png`;
                readingNewSong = false;
            } else {
                document.getElementById('songPicture').style.background = 'url(../assets/no_image.svg)';
                document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image.svg)';
                albumArt = '../assets/no_image.svg';
                dataUrl = '../../assets/no_image.svg';
                img = `${app.getAppPath()}/assets/no_image.png`;
                readingNewSong = false;
            }
        } else {
            document.getElementById('songPicture').style.background = `url('http://localhost:5673/${img}.jpg')`
            document.getElementById('songPictureBlur').style.background = `url('http://localhost:5673/${img}.jpg')`;
            readingNewSong = false;
            dataUrl = img;
        }
        if (process.platform == 'linux') {
            document.getElementById('songPicture').style.background = `url('http://localhost:5673/${img}.jpg')`
            document.getElementById('songPictureBlur').style.background = `url('http://localhost:5673/${img}.jpg')`;
            readingNewSong = false;
            dataUrl = img;
            try {
                mprisPlayer.metadata = {
                    'xesam:title': Title,
                    'xesam:artist': artist,
                    'xesam:album': album,
                    'mpris:trackid': mprisPlayer.objectPath('track/0'),
                    'mpris:artUrl': `http://localhost:5673/${img}.jpg`
                };
                mprisPlayer.playbackStatus = 'Playing';
            } catch(err) {
                'poop hahahahahahaha'
            }
        }
        tagInfo = {
            'title': Title,
            'artist': artist,
            'album': album,
            'art': img
        }
        ipc.send('tag-info', tagInfo);
        if (process.platform == 'win32') {
            Controls.displayUpdater.thumbnail = RandomAccessStreamReference.createFromUri(new Uri(`http://localhost:5673/${img}.jpg`));
            Controls.displayUpdater.update();
        }
    }
}

let convolverGain = audioCtx.createGain();
let convolver = audioCtx.createConvolver();
let masterGain = audioCtx.createGain();
let masterCompression = audioCtx.createDynamicsCompressor();
let impulseData = [];

function impulseGet() {
    convolver = audioCtx.createConvolver();
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open('GET', '../assets/subway.wav', true);
    ajaxRequest.responseType = 'arraybuffer';
    ajaxRequest.onload = function () {
        impulseData = ajaxRequest.response;
        audioCtx.decodeAudioData(impulseData, function (buffer) {
            let conBuffer = buffer;
            convolver.buffer = conBuffer;
            convolver.normalize = true;
            convolverGain.gain.value = 1;
            convolverGain.connect(convolver);
            convolver.connect(masterGain);
        });
    }
    ajaxRequest.send();
}
let reverbEnabled = false;
let reverbFirst = true;
$('#reverbSwitch').click(function () {
    if (reverbEnabled == false) {
        if (reverbFirst == true) {
            source.connect(convolverGain);
            source.connect(masterGain);
            masterGain.connect(masterCompression);
            masterCompression.connect(audioCtx.destination);
            impulseGet();
            convolver.disconnect();
            reverbEnabled = true;
            reverbFirst = false;
        } else {
            masterCompression.connect(audioCtx.destination);
            reverbEnabled = true;
        }
    } else {
        masterCompression.disconnect(audioCtx.destination);
        reverbEnabled = false;
    }
})
let gainEnabled = false;
$('#gainSwitch').click(() => {
    switch (gainEnabled) {
        case false:
            gain.gain.value = gainInput
            gainEnabled = true;
            break;
        case true:
            gain.gain.value = 1;
            gainEnabled = false;
    }
})

let gainInput = 1;
$('#gainInput').change(function () {
    if ($(this).val() >= 100) $(this).val(100);
    if ($(this).val() <= 0) $(this).val(1);
    gainInput = $(this).val();
    if (gainEnabled == true) {
        gain.gain.value = gainInput;
    }
})

let reverbInput = 1;
$('#reverbInput').change(function () {
    if ($(this).val() >= 100) $(this).val(10);
    if ($(this).val() <= 0) $(this).val(1);
    reverbInput = $(this).val();
    convolverGain.gain.value = reverbInput;
})

$('#openDevTools').click(function () {
    let remote = require('electron').remote;
    remote.getCurrentWindow().toggleDevTools();
})

$('#pauseButton').click(function () {
    resumeButton()
})

function buttonActive(e) {
    $('.play-type-wrapper button').removeClass('button-active');
    $('.play-type-wrapper button').prop('disabled', false)
    $(`#${e}`).addClass('button-active');
    $(`#${e}`).prop('disabled', true);
    console.log(e)
}

let currentTab;
let tabSection = 'songs'
$('#libraryButton').click(() => {
    $('.top-bar h2').show();
    $(`#playlistsPage`).removeClass('active-tab');
    tabSection = 'songs'
    $(`#songsPage`).addClass('active-tab');
    tab = 'songs';
    listFiles('FTREGULAR');
    buttonActive('libraryButton');
})

$('.top-bar h2, #playlistsTab').click(function () {
    $(`#newContentWrapper *`).removeClass('active-tab');
    tabSection = $(this).attr('id').substr(0, $(this).attr('id').length - 3);
    $(`#${tabSection}Page`).addClass('active-tab');
    if ($(this).attr('id') == 'playlistsTab') {
        tab = 'playlists';
        listFiles('FTREGULAR');
        buttonActive('playlistsTab');
        $('.top-bar h2').hide();
    } else {
        $('.top-bar h2').removeClass('tab-active');
        $(this).addClass('tab-active')
    }
    if (tabSection == 'songs') {
        currentTab = 'songs'
        $('#songsPage').css('visibility', 'hidden');
        $('.list-wrapper').html('');
        $('#artistList').html('');
        $('#albumList').html('');
        $('.album-image').hide();
        listFiles('FTREGULAR');
    }
    if (tabSection == 'artists') {
        currentTab = 'artists'
        $('#songsPage').css('visibility', 'hidden');
        $('#albumArtistBack').css('visibility', 'visible');
        $('.list-wrapper').html('');
        $('#albumList').html('');
        $('.album-image').hide();
        listArtists();
    }
    if (tabSection == 'albums') {
        currentTab = 'albums'
        $('#songsPage').css('visibility', 'hidden');
        $('#albumArtistBack').css('visibility', 'visible');
        $('.list-wrapper').html('');
        $('#artistList').html('');
        listAlbums();
    }
});

async function listArtists() {
    $('#artistList').html('');
    let usedArtists = [];
    for (let i=0; i < keepSongList.length; i++) {
        let getArtist = songMetadata[keepSongList[i]].artist;
        if (getArtist == undefined) continue;
        let formatArtist = getArtist.replace(/["]/g, "");
        artistCheckName[formatArtist] = getArtist;
        if (usedArtists.indexOf(getArtist) == -1) {
            usedArtists.push(getArtist);
            $('#artistList').append(`<div class="artist-item" id="artist-${formatArtist}"><h3>${getArtist}</h3></div>`);
        }
    }
    let artistName = 'FTREGULAR';
    $('.artist-item').click((info) => {
        artistName = artistCheckName[info.target.id.substr(7)];
        $('.list-wrapper').html('');
        tabTitle = artistName;
        listFiles(artistName);
        $('#artistsPage').removeClass('active-tab');
        $('#songsPage').addClass('active-tab');
    });
}

async function listAlbums() {
    $('#albumList').html('');
    let usedAlbum = [];
    for (let a=0; a < keepSongList.length; a++) {
        let getAlbum = songMetadata[keepSongList[a]].album;
        if (getAlbum == undefined) continue;
        let formatAlbum = getAlbum.replace(/[" ]/g, "");
        let findAlbum = getAlbum.replace(/[.:<>"*?/{}()|[\]\\]/g, "_");
        albumCheckName[formatAlbum] = getAlbum;
        if (usedAlbum.indexOf(getAlbum) == -1) {
            usedAlbum.push(getAlbum);
            $('#albumList').append(`<div class="album-item" id="album-${formatAlbum}"><div class="album-item-img" style="background-image: url('http://localhost:5673/${findAlbum}.jpg');"></div><div class="album-text-flex"><h3>${getAlbum}</h3></div></div>`);
        }
    }
    let albumName = 'FTREGULAR';
    $('.album-item').click((info) => {
        albumName = albumCheckName[info.target.id.substr(6)];
        let findAlbum = albumName.replace(/[.:<>"*?/{}()|[\]\\]/g, "_");
        $('.list-wrapper').html('');
        tabTitle = albumName;
        listFiles(albumName);
        $('#albumsPage').removeClass('active-tab');
        $('#songsPage').addClass('active-tab');
        $('.album-image').show().css('background-image', `url('http://localhost:5673/${findAlbum}.jpg')`);
    });
}

$('#albumArtistBack').click(() => {
    $(`#${currentTab}Tab`).click();
})

function resumeButton(f) {
    if (currentlyPlaying == false) {
        pauseButtonActive = true;
        currentSongPlaying = 0;
        highlightSong = 0;
        newFileChosen = allFilesList[0];
        newFileName = f.slice(0, -fName[fName.length - 1].length - 1);
        $(`#${highlightSong} i`).text('volume_up');
        $('#pauseButton').text('pause')
        songActive();
        findSong();
    }
    switch (pauseButtonActive) {
        case false:
            pauseButtonActive = true;
            audio.pause();
            $('title').text('Firetail');
            toolbarPlay();
            if (process.platform == 'linux') {
                try {
                    mprisPlayer.playbackStatus = 'Paused';
                } catch(err) {
                    'poopies'
                }
            }
            $('#songPicture').addClass('song-picture-decrease');
            $('#songPictureBlur').addClass('song-blur-hidden');
            if (process.platform == 'win32') {
                Controls.playbackStatus = MediaPlaybackStatus.paused;
            }
            $(`#pauseButton, #${highlightSong} i`).text('play_arrow');
            break;
        case true:
            pauseButtonActive = false;
            audio.play();
            $('#pauseButton').text('pause')
            toolbarPause();
            if (artist == "Unknown Artist") {
                $('title').text(`${newFileName}`);
            } else {
                $('title').text(`${artist} - ${Title}`)
            }
            toolbarPause();
            if (process.platform == 'linux') {
                try {
                    mprisPlayer.playbackStatus = 'Playing';
                } catch(err) {
                    'funny poopies alalalala hahaha'
                }
            }
            $('#songPicture').removeClass('song-picture-decrease');
            $('#songPictureBlur').removeClass('song-blur-hidden');
            if (process.platform == 'win32') {
                Controls.playbackStatus = MediaPlaybackStatus.playing;
            }
            if ($(`#${highlightSong} i`).is(':hover')) {
                $(`#${highlightSong} i`).text('pause');
            } else {
                $(`#${highlightSong} i`).text('volume_up');
            }
    }
    ipc.send('play-pause-mini')
}

$('#seekWrapper').mouseover(function () {
    if (currentlyPlaying === true) {
        $('#seekHandle').addClass('handle-hover');
    }
})

$('#seekWrapper').mouseleave(function () {
    if (currentlyPlaying === true) {
        if (!seekMouseDown === false) return;
        $('#seekHandle').removeClass('handle-hover');
    }
})

$('#volWrapper').mouseover(function () {
    if (currentlyPlaying === true) {
        $('#volHandle').addClass('handle-hover');
    }
})

$('#volWrapper').mouseleave(function () {
    if (currentlyPlaying === true) {
        if (!volMouseDown === false) return;
        $('#volHandle').removeClass('handle-hover');
    }
})

$('#volumeButton').click(function () {
    switch (isMuted) {
        case false:
            isMuted = true;
            muteSaveVol = audio.volume;
            audio.volume = 0;
            currentVol = audio.volume;
            volWidth = volFillBar.style.width;
            volFillBar.style.width = 0;
            $(this).text('volume_off');
            break;
        case true:
            isMuted = false;
            audio.volume = muteSaveVol;
            currentVol = audio.volume;
            volFillBar.style.width = volWidth;
            $(this).text('volume_up')
    }
})

function timeFormat(s) {
    var min = Math.floor(s / 60);
    var sec = Math.floor(s - (min * 60));
    if (sec < 10){ 
        sec = `0${sec}`;
    }
    return `${min}:${sec}`;
}

let duration;
let timeNow;

function seekTimeUpdate() {
    if (isNaN(audio.duration) == true) {
        document.getElementById('songDurationLength').innerHTML = `-:--`
    } else {
        duration = timeFormat(audio.duration);
        document.getElementById('songDurationLength').innerHTML = duration
    }
    let p = audio.currentTime / audio.duration;
    seekFillBar.style.width = p * 100 + '%';
    if (audio.currentTime === audio.duration) {
        switch (repeatEnabled) {
            case true:
                audio.currentTime = 0;
                audio.play();
                break;
            case false:
                nextSong();
                break;
        }
    }
    let songLength = parseInt(audio.currentTime);
    timeNow = timeFormat(songLength);
    document.getElementById('songDurationTime').innerHTML = timeNow
    let seekTimeMini = {
        'currentTimeString': timeNow,
        'songDurationString': duration,
        'currentTimeValue': audio.currentTime,
        'songDurationValue': audio.duration
    }
    ipc.send('seek-time-mini', seekTimeMini)
}

ipc.on('remove-audio-listener', () => {
    audio.removeEventListener('timeupdate', seekTimeUpdate);
})

ipc.on('seek-time-main', (event, arg) => {
    audio.currentTime = arg;
    audio.addEventListener('timeupdate', seekTimeUpdate);
})

let tmp = require('tmp');
let tmpobj = tmp.dirSync();
let dataUrl;
let tmpFile;
let directory = tmpobj.name;

function clearTempFiles() {
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

function appExit() {
    if (process.platform == 'linux') {
        clearTempFiles()
        setTimeout(() => {
            app.exit();
        }, 500)
    } else {
        app.exit();
    }
}

let reload = false;

window.onbeforeunload = (i) => {
    settings.set('last-song-time', audio.currentTime);
    if (reload == true) {
        location.reload();
    } else {
        remote.getCurrentWindow().minimize();
        setTimeout(() => {
            remote.getCurrentWindow().hide();
        }, 150)
        i.returnValue = false;    
    }
}

let seekP;
let volP;

ipc.on('exit-time', () => {
    if (currentlyPlaying) {
        ipc.send('last-song-time', audio.currentTime);
    } else {
        ipc.send('last-song-time');
    }
})

function seekBarTrack() {
    audio.addEventListener('timeupdate', seekTimeUpdate);
    if (runonce == true) {
        audio.currentTime = settings.get('last-song-time')
        duration = timeFormat(audio.duration);
        seekFillBar.style.width = seekP * 100 + '%';
        document.querySelector('#songDurationTime').innerHTML = duration;
        runonce = false
    }
}

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

function seekGetP(e) {
    seekP = (e.clientX - seekBar.getBoundingClientRect().x) / seekBar.clientWidth;
    seekP = clamp(0, seekP, 1);
    return seekP;
}

function volGetP(e) {
    volP = (e.clientX - volBar.getBoundingClientRect().x) / volBar.clientWidth;
    volP = clamp(0, volP, 1);
    return volP;
}

function mousetouchdown(e) {
    if (currentlyPlaying === true) {
        if (e.touch) {
            e = e.touches[0]
        }
        seekMouseDown = true;
        seekP = seekGetP(e);
        seekFillBar.style.width = seekP * 100 + '%';
        audio.removeEventListener('timeupdate', seekTimeUpdate);
        $('#seekHandle').addClass('handle-hover');
    }
}

seekBarWrapper.addEventListener('mousedown', function (e) {
    mousetouchdown(e);
});

seekBarWrapper.addEventListener('touchstart', function (e) {
    mousetouchdown(e);
});

function voltouchmousedown(e) {
    if (currentlyPlaying === true) {
        if (e.touches) {
            e = e.touches[0]
        }
        volMouseDown = true;
        volP = volGetP(e);
        volFillBar.style.width = volP * 100 + '%';
        $('#volHandle').addClass('handle-hover');
        if (audio.volume == 0) {
            isMuted = true;
            $('#volumeButton').text('volume_off');
        } else {
            isMuted = false;
            $('#volumeButton').text('volume_up');
        }
        muteSaveVol = audio.volume;
    }
}

volWrapper.addEventListener('mousedown', function (e) {
    voltouchmousedown(e)
})

volWrapper.addEventListener('touchstart', function (e) {
    voltouchmousedown(e)
})

function mousetouchmove(e) {
    if (seekMouseDown == false && volMouseDown == false) return;
    if (currentlyPlaying === true) {
        if (seekMouseDown == true) {
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
            $('#songDurationTime').html(`${minutes}:${seconds}`);
        }
        if (volMouseDown == true) {
            if (e.touches) {
                e = e.touches[0]
            }
            volP = volGetP(e);
            volFillBar.style.width = volP * 100 + '%';
            audio.volume = volP * 1
            currentVol = audio.volume;
        }
    }
}

window.addEventListener('mousemove', function (e) {
    $('li.results-link').removeClass('nohover');
    mousetouchmove(e)
});

window.addEventListener('touchmove', function (e) {
    mousetouchmove(e)
});

function mousetouchup(e) {
    if (seekMouseDown == false && volMouseDown == false) return;
    if (currentlyPlaying === true) {
        if (seekMouseDown == true) {
            if (e.changedTouches) {
                e = e.changedTouches[0]
            }        
            seekMouseDown = false;
            seekP = seekGetP(e);
            seekFillBar.style.width = seekP * 100 + '%';
            audio.currentTime = seekP * audio.duration;
            settings.set('last-song-time', audio.currentTime);
            seekBarTrack();
            $('#seekHandle').removeClass('handle-hover');
        }
        if (volMouseDown == true) {
            if (e.touches) {
                e = e.touches[0]
            }
            if (audio.volume == 0) {
                isMuted = true
                $('#volumeButton').text('volume_off');
            } else {
                isMuted = false;
                $('#volumeButton').text('volume_up');
            }
            volMouseDown = false;
            volFillBar.style.width = volP * 100 + '%';
            audio.volume = volP * 1
            currentVol = audio.volume;
            if (isMuted == true && audio.volume != 0) {
                isMuted = false;
                $('#volumeButton').text('volume_up');
            }
            $('#volHandle').removeClass('handle-hover');
        }
    }
}

window.addEventListener('mouseup', function (e) {
    mousetouchup(e);
});

window.addEventListener('touchend', function (e) {
    mousetouchup(e);
});
