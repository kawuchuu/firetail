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

var audio;
var currentlyPlaying = false;
var fileTotal;
var newFileChosen;
var newFileName;
var fileName;
var pauseButtonActive = false;
var currentSongPlaying;
var allFilesList = [];
var repeatEnabled = false;
var artist;
var album;
var Title;
var tags;
var shuffleEnabled = false;
var shuffleOrder = [];
var fileSongListStore = [];
var fileAudio;
var songTitleName;
var durationSongLength;
var durationSeconds;
var durationMinutes;
var seconds;
var minutes;
var seekBar = document.querySelector('.seek-bar');
var volBar = document.querySelector('.vol-bar');
var seekBarWrapper = document.querySelector('#seekWrapper');
var seekFillBar = seekBar.querySelector('#seekFill');
var audioLength = document.querySelector('#songDuration');
var volFillBar = volBar.querySelector('#volFill');
var volWrapper = document.querySelector('#volWrapper')
var seekMouseDown = false;
var volMouseDown = false;
var p;
var s = [];
var previousDuration;
var sortFileExt = {};
var shuffleList = [];
var shuffleCheck = false;
var shuffleWait = false;
var shuffleCurrent;
var highlightSong;
var currentVol = 1;
var muteSaveVol;
var volWidth;
var isMuted = false;
var shuffleEnableFirst = false;
var shuffleDisableFirst = false;
var checkForShuffle = false;
var albumArt;
var AudioContext = window.AudioContext;
var audioCtx = new AudioContext();
var gain;
var theme = 'dark';
var menuOpen = false;
var noSong = false;
var remote = require('electron').remote;
var bgImage;
var fName;
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
var ver = require('../package.json').version;
const chokidar = require('chokidar');
const md = require('markdown-it')();

function isDev() {
    return process.mainModule.filename.indexOf('app.asar') === -1;
}

if (isDev()) {
    ver = ver + " DEV";
    $('#openDevTools').show();
}

if (process.platform == 'linux') {
    var mpris = require('mpris-service');
    var mprisPlayer = new mpris({
        name: 'firetail',
        identity: 'Firetail',
        supportedInterfaces: ['player']
    });
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

if (settings.has('button-style') == false) {
    settings.set('button-style', 'new');
    buttonStyleSelect('new')
} else {
    buttonStyleSelect(settings.get('button-style'))
}

if (settings.has('audio-effects') == false) {
    settings.set('audio-effects', false);
    $('#effectsButton').hide();
}

if (settings.has('auto-refresh') == false) {
    settings.set('auto-refresh', false);
}

if (settings.get('audio-effects') == true) {
    $('#effectsButton').show();
}

var clientId = '586510014211031040';
const rpc = new drpc.Client({
    transport: 'ipc'
})

if (settings.get('discordrpc') == true) {
    async function rpcSetActivity() {
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
var mpOpen = false;
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

if (process.platform === 'win32') {
    $('.title-bar-wrapper').show();
    $('#openFileBrowser').show();
}

if (process.platform === 'linux') {
    $('.title-bar').hide();
    $('.app-content').css({
        marginTop: '30px'
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
        height: 'calc(100% - 140px)'
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

$('.list-wrapper').html('<p style="text-align: center; font-weight: bold; margin-left: 150px;">Loading...');

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
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

$('body').on("contextmenu", "li.results-link", function (e) {
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
        display: 'block',
        left: xPosition + 'px',
        top: yPosition + 'px'
    });
    return false;
});
$('html').click(() => {
    $('.context-menu').hide();
})

var fileextentions = ['mp3', 'm4a', 'wav', 'ogg', '3gp', 'aac', 'flac', 'webm', 'raw']
var reloading;
var ctxMenu;
var xPosition;
var yPosition;
var playlistList = {};
var clickedSong;
var songMetadata = {};
var songData = {}
var tab = 'songs';
var directories = [`${os.homedir}/Music/Audiation`];

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
    }, 250)
}

function loadFiles() {
    songMetadata = {};
    $('.createLibraryMsg').show();
    fs.pathExists(`${os.homedir}/Music/Audiation`, (err, exists) => {
        if (err) throw err;
        if (exists == false) {
            fs.mkdir(`${os.homedir}/Music/Audiation`, (err) => {
                if (err) throw err;
            });
        };
        directories.forEach((r, t) => {
            readdir(r, (err, files) => {
                if (err) console.error(err);
                if (files.length < 1) {
                    iconStyleSelect(settings.get('icon-style'))
                    removeLoader();
                    reloading = false;
                    return $('.list-wrapper').html(`<p style="font-weight: bold; margin-left: 215px;">Please add some files to the<br>following directory:<br>${os.homedir}/Music/Audiation`);
                } 
                fileextentions.forEach((e) => {
                    sortFileExt[e] = files.filter(f => f.split(".").pop() === e);
                    s = s.concat(sortFileExt[e]);
                    s.sort(function (a, b) {
                        if (a.toLowerCase() < b.toLowerCase()) return -1;
                        if (a.toLowerCase() > b.toLowerCase()) return 1;
                        return 0;
                    });
                });
                var amount = 0;
                s.forEach((f, i) => {
                    new Promise((resolve) => {
                        new id3.Reader(f)
                            .setTagsToRead(['title', 'artist', 'album'])
                            .read({
                                onSuccess: function (tag) {
                                    songData = {
                                        'title': tag.tags.title,
                                        'artist': tag.tags.artist,
                                        'album': tag.tags.album
                                    }
                                    resolve(songData);
                                },
                                onError: function (err) {
                                    resolve('{}');
                                }
                            })
                    }).then((e) => {
                        songMetadata[f] = e;
                        fs.writeJson(`${app.getPath('userData')}/library.json`, songMetadata);
                        amount++;
    
                        if (amount == s.length) {
                            console.log('FINISHED, CALLING LISTFILES');
                            listFiles();
                        };
                    })
                })
            });
        });
    });
}
var newList;
var list;
var working = false;

function watcherAdd(f) {
    console.log('WATCHER ADD FOR FILE ' + f)
    working = true;
    new Promise((resolve) => {
        new id3.Reader(f)
            .setTagsToRead(['title', 'artist', 'album'])
            .read({
                onSuccess: function (tag) {
                    songData = {
                        'title': tag.tags.title,
                        'artist': tag.tags.artist,
                        'album': tag.tags.album
                    }
                    resolve(songData);
                },
                onError: function (err) {
                    resolve('{}');
                }
            })
    }).then((i) => {
        for (i = 0; i < fileextentions.length; i++) {
            var ext = f.split(".").pop() === fileextentions[i];
            if (ext == true) break;
            if (i + 1 == fileextentions.length) {
                return;
            }
        };
        songMetadata[f] = i
        fs.writeJsonSync(`${app.getPath('userData')}/library.json`, songMetadata);
        console.log('Finished adding to library!');
        $('.list-wrapper').html('Loading...');
        listFiles();

    });
}

function unlinkFile(path) {
    console.log('WATCHER UNLINK FOR FILE ' + path)
    working = true;
    for (var i = 0; i < fileextentions.length; i++) {
        var ext = path.split(".").pop() === fileextentions[i];
        if (ext == true) break;
        if (i + 1 == fileextentions.length) {
            return;
        }
    };
    delete songMetadata[path];
    fs.writeJsonSync(`${app.getPath('userData')}/library.json`, songMetadata);
    console.log('Finished removing from library!');
    $('.list-wrapper').html('Loading...');
    listFiles()
}

if (settings.get('auto-refresh') == true) {
    const watcher = chokidar.watch(directories, {
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('add', path => watcherAdd(path));
    watcher.on('unlink', path => unlinkFile(path));
}

function listFiles() {
    reloading = false;
    s = [];
    allFilesList = [];
    shuffleOrder = [];
    fileSongListStore = [];
    shuffleList = [];
    new Promise(() => {
        if (!fs.existsSync(`${app.getPath('userData')}/library.json`)) {
            loadFiles();
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
                        return $('.list-wrapper').html(`<p style="font-weight: bold; margin-left: 215px;">Please add some files to the<br>following directory:<br>${os.homedir}/Music/Audiation`);    
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
                a.sort(function (a, b) {
                    if (a.toLowerCase() < b.toLowerCase()) return -1;
                    if (a.toLowerCase() > b.toLowerCase()) return 1;
                    return 0;
                });
                $('.list-wrapper').html('');
                a.forEach((f, i) => {
                    forEachFile(f, i);
                })
                shuffleOrder = shuffle(allFilesList);
                allFilesList = fileSongListStore;
                shuffleOrder.forEach((f, i) => {
                    shuffleList.push(fileSongListStore.indexOf(f));
                });
                var searchSongs;
                if (currentlyPlaying === true) {
                    searchSongs = fileSongListStore.indexOf(newFileChosen);
                    if (searchSongs != -1) {
                        highlightSong = searchSongs;
                        currentSongPlaying = searchSongs;
                        songActive()
                    } else {
                        highlightSong = null;
                        currentSongPlaying = null;
                        noSong = true;
                    }
                }
                iconStyleSelect(settings.get('icon-style'))
                removeLoader();
            })
        }
    })
}

function forEachFile(f, i) {
    function playSong() {
        currentSongPlaying = i;
        highlightSong = i;
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
                findSong();
                songActive();
            }
        })
    }
    fileSongListStore.push(f);
    allFilesList.push(f);
    fName = f.split('.');
    fileName = f.slice(0, -fName[fName.length - 1].length - 1);
    if (process.platform == 'win32') {
        fileName = fileName.substr(fileName.lastIndexOf('\\') + 1);
    } else {
        fileName = fileName.substr(fileName.lastIndexOf('/') + 1);
    }
    $(`#${tab}Page .list-wrapper`).append(`<li draggable="true" class="results-link" id="${i}"><i class="material-icons play-pause" style="opacity: 0;">play_arrow</i><p class="new-song-title">${fileName}`);
    $(`#${i} p`).dblclick(function () {
        shuffleCheck = false;
        if (shuffleEnabled == true) {
            shuffleCheck = true;
            shuffleEnableFirst = true;
        }
        playSong();
    });
    $(`#${i} i`).click(function () {
        shuffleCheck = false;
        if (shuffleEnabled == true) {
            shuffleCheck = true;
            shuffleEnableFirst = true;
        }
        if (currentlyPlaying === true && $(`#${i}`).attr('id') === `#${highlightSong}`.substr(1)) {
            resumeButton();
        } else {
            playSong()
            $(`#${i} i`).text('pause');
        }
    })
    $(`#${i}`).mouseover(function () {
        $(`#${i} i`).addClass('song-opac')
    })
    $(`#${i} i`).mouseover(function () {
        if (highlightSong == i && pauseButtonActive == false) {
            $(`#${i} i`).text('pause');
        }
    })
    $(`#${i}`).mouseleave(function () {
        if (highlightSong !== i) {
            $(`#${i} i`).removeClass('song-opac')
            $(`#${i} i`).text('play_arrow');
        }
    })
    $(`#${i} i`).mouseleave(function () {
        if (highlightSong == i) {
            $(`#${i} i`).addClass('song-opac');
            if (pauseButtonActive == false) {
                $(`#${i} i`).text('volume_up')
            }
        }
    })
    document.getElementById(i).ondragstart = (event) => {
        event.preventDefault()
        ipc.send('ondragstart', null);
    }
}

listFiles();

var addSong;
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

function previousSong() {
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
    appExit();
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
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
});

function maximizeWindow() {
    var window = remote.getCurrentWindow();
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
    } else {
        $('.title-bar').css({
            background: '#222222'
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
    } else {
        $('.title-bar').css({
            background: '#1e1e1e'
        });
    }
    $('.tb-button').css({
        opacity: 1
    })
})

$('.tb-minimize').click(function () {
    var window = remote.getCurrentWindow();
    window.minimize();
})

window.onkeydown = function (e) {
    return !(e.keyCode == 32);
};

document.addEventListener("keydown", function (e) {
    switch (e.which) {
        case 32:
            if (currentlyPlaying) {
                resumeButton();
            }
            break;
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

var subMenuList = {
    'appearanceSubButton': 'appearanceSubmenu',
    'aboutSubButton': 'aboutSubmenu',
    'experimentSubButton': 'experimentSubmenu',
    'generalSubButton': 'generalSubmenu',
    'changelogSubButton': 'changelogSubmenu'
}

var linkBack = {
    'appearanceSubmenu': 'menuMain',
    'aboutSubmenu': 'menuMain',
    'experimentSubmenu': 'generalSubmenu',
    'generalSubmenu': 'menuMain',
    'changelogSubmenu': 'aboutSubmenu'
}

var menuTitle = {
    'menuMain': 'Settings',
    'appearanceSubmenu': 'Appearance',
    'aboutSubmenu': 'About',
    'experimentSubmenu': 'Experiments',
    'generalSubmenu': 'General',
    'changelogSubmenu': 'Changelog'
}

var licenseInfo = "This project is under the terms of the GNU General Public Licence (v.3.0)"

var experimentSettings = [{
    info: {
        title: 'Experiments'
    },
    controls: [{
            customHTML: '<div style="word-break: normal; font-size: 14px; white-space: normal;"><span style="font-weight: bold">WARNING: </span>These features are experimental/incomplete and may break at anytime. Proceed with caution!</div>'
        },
        {
            switch: {
                title: 'Auto-refresh list',
                desc: "Automatically refreshes list when a song is added, changed or removed",
                id: 'autoRefreshToggle'
            }
        },
        {
            switch: {
                title: 'Audio Effects',
                desc: "Adds a panel to control audio effects.",
                id: 'audioEffectsToggle'
            }
        }
    ]
}]

var aboutSettings = [{
    info: {
        title: 'About'
    },
    controls: [{
            customHTML: `<div class="about-firetail"><img draggable="false" src="../assets/icon.png"><div class="about-name"><div class="name-ver"><h2>Firetail</h2><div class="about-ver">v.${ver}</div></div><div class="about-others"><div>Copyright &copy; projsh_ 2019</div><div>${licenseInfo}`
        },
        {
            subButton: {
                title: 'Changelog',
                id: 'changelogSubButton',
                icon: 'notes'
            }
        }
    ]
}]

var changelogSettings = [{
    info: {
        title: 'Changelog'
    },
    controls: [
        {
            customHTML: `<div id="changelog"></div>`
        }
    ]
}]

var appearanceSettings = [{
    info: {
        title: 'Appearance'
    },
    controls: [{
            select: {
                title: 'Theme',
                desc: "Sets theme to your choice.",
                id: 'themeSelect',
                options: [{
                        option: {
                            title: 'Dark',
                            value: 'dark'
                        }
                    },
                    {
                        option: {
                            title: 'Light',
                            value: 'light'
                        }
                    }
                ]
            }
        },
        {
            select: {
                title: 'Colour Accent',
                desc: 'Sets colour accent to your choice.',
                id: 'colouraccentSelect',
                options: [{
                        option: {
                            title: 'Firetail',
                            value: 'firetail'
                        }
                    },
                    {
                        option: {
                            title: 'Audiation',
                            value: 'audiation'
                        }
                    },
                    {
                        option: {
                            title: 'Nature',
                            value: 'nature'
                        }
                    },
                    {
                        option: {
                            title: 'Aqua',
                            value: 'aqua'
                        }
                    }
                ]
            }
        },
        {
            select: {
                title: 'Icon Style',
                desc: 'Sets icon style to your choice',
                id: 'iconStyleSelect',
                options: [
                    {
                        option: {
                            title: 'Filled',
                            value: 'filled'
                        }
                    },
                    {
                        option: {
                            title: 'Rounded',
                            value: 'rounded'
                        }
                    },
                    {
                        option: {
                            title: 'Outlined',
                            value: 'outlined'
                        }
                    }
                ]
            }
        },
        {
            select: {
                title: 'Button Style',
                desc: 'Sets button style to your choice',
                id: 'buttonStyleSelect',
                options: [
                    {
                        option: {
                            title: 'New',
                            value: 'new'
                        }
                    },
                    {
                        option: {
                            title: 'Old',
                            value: 'old'
                        }
                    }
                ]
            }
        },
        {
            switch: {
                title: 'Mini Player Background',
                desc: "Sets mini player's background to the song's album art",
                id: 'miniBgToggle',
                toggled: true
            }
        }
    ]
}]

var generalSettings = [{
    info: {
        title: 'General'
    },
    controls: [
        {
            subButton: {
                title: 'Experiments',
                id: 'experimentSubButton',
                icon: 'bug_report'
            }
        },
        {
            switch: {
                title: 'Discord Rich Presence',
                desc: "Sets currently playing song as your Discord status",
                id: 'discordToggle'
            }
        }
    ]
}]

var settingsMenu = [{
    info: {
        title: 'Settings'
    },
    controls: [{
            subButton: {
                title: 'General',
                id: 'generalSubButton',
                icon: 'settings'
            }
        },
        {
            subButton: {
                title: 'Appearance',
                id: 'appearanceSubButton',
                icon: 'palette'
            }
        },
        {
            subButton: {
                title: 'About',
                id: 'aboutSubButton',
                icon: 'info'
            }
        }
    ]
}]

var settingsPage = {
    'appearanceSubButton': appearanceSettings,
    'aboutSubButton': aboutSettings,
    'experimentSubButton': experimentSettings,
    'generalSubButton': generalSettings,
    'changelogSubButton': changelogSettings
}

var selectOptions = {
    'iconStyleSelect': 'icon-style',
    'colouraccentSelect': 'colour-accent',
    'themeSelect': 'theme',
    'buttonStyleSelect': 'button-style'
}

function createSwitch(i) {
    return `<div class="label-switch"><div><p>${i.title}</p><div class="switch-desc">${i.desc}</div></div><label class="switch"><input id="${i.id}" type="checkbox"><span class="switch-slider round"></span></label></div>`
}

function createSubmenuButton(i) {
    return `<div class="menu-submenu-button" id="${i.id}"><div class="subbutton-name"><i class="material-icons material-icons-${settings.get('icon-style')}">${i.icon}</i><p>${i.title}</p></div><i class="material-icons">keyboard_arrow_right</i></div>`
}

function createSelectList(i) {
    var addOption;
    i.options.forEach((f) => {
        var selected = '';
        optionInfo = f.option;
        if (selectOptions[i.id]) {
            if (settings.get(selectOptions[i.id]) == optionInfo.value) {
                selected = 'selected'
            }
        }
        addOption += `<option ${selected} value="${optionInfo.value}">${optionInfo.title}</option>`
    })
    return `<div class="select-list" id="${i.id}List"><div><p>${i.title}</p><div class="switch-desc">${i.desc}</div></div><div class="select-container"><select id="${i.id}">${addOption}</select></div></div>`
}

var switches = [];
var options = [];
var id;
var optionInfo;
var topElement;

function createSettingsMenu(e, o) {
    switches = [];
    options = [];
    new Promise((resolve) => {
        e[0].controls.forEach((f, i) => {
            var newControl;
            var buttonType = Object.keys(f)[0];
            switch (buttonType) {
                case 'switch':
                    newControl = createSwitch(e[0].controls[i].switch);
                    switches.push(e[0].controls[i].switch.id)
                    break;
                case 'subButton':
                    newControl = createSubmenuButton(e[0].controls[i].subButton);
                    id = e[0].controls[i].subButton.id;
                    break;
                case 'customHTML':
                    newControl = `<div class="customHTML">${e[0].controls[i].customHTML}</div>`;
                    break;
                case 'select':
                    newControl = createSelectList(e[0].controls[i].select)
            }
            if (o) {
                $(`#menuMain`).append(newControl);
            } else {
                $(`#${getSubId}`).append(newControl);
            }
        })
        resolve(e)
    }).then((e) => {
        $('.menu-submenu-button').click(function () {
            if (transition == true) return;
            transition = true;
            getSubId = $(this).attr('id');
            if (subMenuList[getSubId] == activeMenu) return;
            getSubId = subMenuList[getSubId];
            $('.menu-controls').append(`<div class="menu-list main right" id="${getSubId}"></div>`);
            var getMenu = settingsPage[$(this).attr('id')];
            setTimeout(() => {
                createSettingsMenu(getMenu)
                findMenu('next');
            }, 10)
        });
        if (e[0].info.title == 'Changelog') { 
            fs.readFile(`${app.getAppPath()}/assets/changelog.md`, "UTF8", (err, data) => {
                if (err) { throw err };
                let result = md.render(data);
                $('#changelog').append(result);
            });
        }
        if (settings.get('mini-player-bg') == false) {
            $('#miniBgToggle').prop('checked', false)
        } else {
            $('#miniBgToggle').prop('checked', true)
        }
        if (settings.get('discordrpc') == true) {
            $('#discordToggle').prop('checked', true);
        }
        if (settings.get('audio-effects') == true) {
            $('#audioEffectsToggle').prop('checked', true);
        }
        if (settings.get('auto-refresh') == true) {
            $('#autoRefreshToggle').prop('checked', true);
        }
        switches.forEach((f, i) => {
            $(`#${f}`).click(() => {
                console.log(f)
                window[f]();
            })
        });
        //thanks: https://codepen.io/wallaceerick/pen/ctsCz
        $('select').each(function () {
            var $this = $(this),
                numberOfOptions = $(this).children('option').length;
            $this.addClass('select-hidden');
            $this.wrap('<div class="select"></div>');
            $this.after('<div class="select-styled"></div>');
            var $styledSelect = $this.next('div.select-styled');
            $styledSelect.text($this.children('option').eq(0).text());
            var $list = $('<ul />', {
                'class': 'select-options'
            }).insertAfter($styledSelect);
            for (var i = 0; i < numberOfOptions; i++) {
                if ($this.children('option').eq(i).attr('selected')) {
                    $styledSelect.text($this.children('option').eq(i).text());
                }
                $('<li />', {
                    text: $this.children('option').eq(i).text(),
                    rel: $this.children('option').eq(i).val()
                }).appendTo($list);
            }
            var $listItems = $list.children('li');
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

var menuOpened;

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

function buttonStyleSelect(i) {
    var buttonRemove;
    switch(i) {
        case "new":
            buttonRemove = 'old'
            break;
        case "old":
            buttonRemove = 'new'
            break;
    }
    $('button').removeClass(buttonRemove);
    $('button').addClass(i);
    settings.set('button-style', i)
}

function autoRefreshToggle() {
    if (settings.get('auto-refresh') == true) {
        settings.set('auto-refresh', false)
    } else {
        settings.set('auto-refresh', true);
    }
    $('.restart-container').css('bottom', 0);
    restartRequired = true;
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
        $('.menu-controls').html('<div class="disable-interact"></div><div class="menu-list main" id="menuMain"></div>')
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

var restartRequired = false;

function themeSelect(i) {
    theme = i;
    $('html').attr('class', `${i} ${settings.get('colour-accent')}`);
    settings.set('theme', i);
    if (theme == 'light') {
        $('.title-bar').css({
            background: '#ffffff'
        });
    } else {
        $('.title-bar').css({
            background: '#1e1e1e'
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

var activeMenu = 'menuMain';
var transition = false;

var getSubId;
var previousMenu;

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
                app.quit();
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
var firstPlay = true;
var source;

function findSong() {
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
            if (process.platform == 'linux') {
                mprisPlayer.canPlay = true;
                mprisPlayer.canPause = true;
                mprisPlayer.canControl = true;
                mprisPlayer.canGoNext = true;
                mprisPlayer.canGoPrevious = true;
                mprisPlayer.canSeek = true;
            }
        } catch (err) {
            throw err;
        }
        getSongInfo();
        audio.volume = currentVol;
        seekBarTrack();
        toolbarPause();
    } catch (err) {
        throw err;
    }
}

var img;
var tagInfo;
let readingNewSong = false;

function getSongInfo() {
    if (theme == 'light') {
        document.getElementById('songPicture').style.background = 'url(../assets/no_image_light.svg)';
        document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image_light.svg)';
    } else {
        document.getElementById('songPicture').style.background = 'url(../assets/no_image.svg)';
        document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image.svg)';
    }
    var metadata = songMetadata[newFileChosen];
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
    ipc.send('tag-info', tagInfo)
    var imgWorker = new Worker('./img-worker.js');
    imgWorker.postMessage(newFileChosen);
    imgWorker.onmessage = function(e) {
        if (readingNewSong == true) return;
        readingNewSong = true;
        img = e.data;
        if (img == null) {
            if (theme == 'light') {
                document.getElementById('songPicture').style.background = 'url(../assets/no_image_light.svg)';
                document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image_light.svg)';
                albumArt = '../assets/no_image_light.svg';
                dataUrl = '../../assets/no_image_light.svg';
                readingNewSong = false;
            } else {
                document.getElementById('songPicture').style.background = 'url(../assets/no_image.svg)';
                document.getElementById('songPictureBlur').style.background = 'url(../assets/no_image.svg)';
                albumArt = '../assets/no_image.svg';
                dataUrl = '../../assets/no_image.svg';
                readingNewSong = false;
            }
        } else {
            document.getElementById('songPicture').style.background = `url(${img})`
            document.getElementById('songPictureBlur').style.background = `url(${img})`;
            readingNewSong = false;
            dataUrl = img;
        }
        tagInfo = {
            'title': Title,
            'artist': artist,
            'album': album,
            'art': dataUrl
        }
        ipc.send('tag-info', tagInfo);
    }
}

var convolverGain = audioCtx.createGain();
var convolver = audioCtx.createConvolver();
var masterGain = audioCtx.createGain();
var masterCompression = audioCtx.createDynamicsCompressor();
var impulseData = [];

function impulseGet() {
    convolver = audioCtx.createConvolver();
    ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open('GET', '/assets/SteinmanHall.wav', true);
    ajaxRequest.responseType = 'arraybuffer';
    ajaxRequest.onload = function () {
        impulseData = ajaxRequest.response;
        audioCtx.decodeAudioData(impulseData, function (buffer) {
            conBuffer = buffer;
            convolver.buffer = conBuffer;
            convolver.normalize = true;
            convolverGain.gain.value = 5;
            convolverGain.connect(convolver);
            convolver.connect(masterGain);
        });
    }
    ajaxRequest.send();
}
var reverbEnabled = false;
var reverbFirst = true;
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
var gainEnabled = false;
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

var gainInput = 1;
$('#gainInput').change(function () {
    if ($(this).val() >= 100) $(this).val(100);
    if ($(this).val() <= 0) $(this).val(0);
    gainInput = $(this).val();
    if (gainEnabled == true) {
        gain.gain.value = gainInput;
    }
})

var reverbInput = 1;
$('#reverbInput').change(function () {
    if ($(this).val() >= 100) $(this).val(100);
    if ($(this).val() <= 0) $(this).val(0);
    reverbInput = $(this).val();
    convolverGain.gain.value = reverbInput;
})

$('#openDevTools').click(function () {
    var remote = require('electron').remote;
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

var tabSection = 'songs'
$('#libraryButton').click(() => {
    $('.top-bar h2').show();
    $(`#playlistsPage`).removeClass('active-tab');
    tabSection = 'songs'
    $(`#songsPage`).addClass('active-tab');
    tab = 'songs';
    listFiles();
    buttonActive('libraryButton');
})

/* $('.top-bar h2, #playlistsTab').click(function () {
    $(`#${tabSection}Page`).removeClass('active-tab');
    tabSection = $(this).attr('id').substr(0, $(this).attr('id').length - 3);
    $(`#${tabSection}Page`).addClass('active-tab');
    if ($(this).attr('id') == 'playlistsTab') {
        tab = 'playlists';
        listFiles();
        buttonActive('playlistsTab');
        $('.top-bar h2').hide();
    } else {
        $('.top-bar h2').removeClass('tab-active');
        $(this).addClass('tab-active')
    }
}) */

function resumeButton() {
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
            $(`#pauseButton, #${highlightSong} i`).text('play_arrow');
            $('title').text('Firetail');
            toolbarPlay();
            if (process.platform == 'linux') {
                mprisPlayer.playbackStatus = 'Paused';
            }
            $('#songPicture').addClass('song-picture-decrease');
            $('#songPictureBlur').addClass('song-blur-hidden');
            break;
        case true:
            pauseButtonActive = false;
            audio.play();
            $('#pauseButton').text('pause')
            if ($(`#${highlightSong} i`).is(':hover')) {
                $(`#${highlightSong} i`).text('pause');
            } else {
                $(`#${highlightSong} i`).text('volume_up');
            }
            toolbarPause();
            if (artist == "Unknown Artist") {
                $('title').text(`${newFileName}`);
            } else {
                $('title').text(`${artist} - ${Title}`)
            }
            toolbarPause();
            if (process.platform == 'linux') {
                mprisPlayer.playbackStatus = 'Playing';
            }
            $('#songPicture').removeClass('song-picture-decrease');
            $('#songPictureBlur').removeClass('song-blur-hidden');
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

function audioDuration() {
    durationSongLength = parseInt(audio.duration);
    durationMinutes = Math.floor(durationSongLength / 60);
    durationSeconds = Math.floor(durationSongLength / 1);
    while (durationSeconds >= 60) {
        durationSeconds = durationSeconds - 60;
    }
    if (durationSeconds > -1 && durationSeconds < 10) {
        durationSeconds = ('0' + durationSeconds).slice(-2);
    }
}

function seekTimeUpdate() {
    var p = audio.currentTime / audio.duration;
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
    var songLength = parseInt(audio.currentTime);
    minutes = Math.floor(songLength / 60);
    seconds = Math.floor(songLength / 1);
    while (seconds >= 60) {
        seconds = seconds - 60;
    }
    if (seconds > -1 && seconds < 10) {
        seconds = ('0' + seconds).slice(-2);
    }
    audioDuration();

    document.getElementById('songDurationTime').innerHTML = `${minutes}:${seconds}`
    document.getElementById('songDurationLength').innerHTML = `${durationMinutes}:${durationSeconds}`
    if (isNaN(durationMinutes) == true) {
        document.getElementById('songDurationLength').innerHTML = `-:--`
        durationMinutes = '-'
        durationSeconds = '--'
    }
    var seekTimeMini = {
        'currentTimeString': `${minutes}:${seconds}`,
        'songDurationString': `${durationMinutes}:${durationSeconds}`,
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

var tmp = require('tmp');
var tmpobj = tmp.dirSync();
var dataUrl;
var tmpFile;
var directory = tmpobj.name;

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

if (process.platform == 'linux') {
    setInterval(clearTempFiles, 60000);
}

function appExit() {
    if (process.platform == 'linux') {
        clearTempFiles()
        setTimeout(() => {
            app.quit();
        }, 500)
    } else {
        app.quit();
    }
}

window.onbeforeunload = (i) => {
    if (pauseButtonActive == false) {
        resumeButton()
    }
    if (process.platform == 'linux') {
        appExit();
    }
}
var seekP;
var volP;

function seekBarTrack() {
    audio.addEventListener('timeupdate', seekTimeUpdate);
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

seekBarWrapper.addEventListener('mousedown', function (e) {
    if (currentlyPlaying === true) {
        seekMouseDown = true;
        seekP = seekGetP(e);
        seekFillBar.style.width = seekP * 100 + '%';
        audio.removeEventListener('timeupdate', seekTimeUpdate);
        $('#seekHandle').addClass('handle-hover');
    }
});

volWrapper.addEventListener('mousedown', function (e) {
    if (currentlyPlaying === true) {
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
})

window.addEventListener('mousemove', function (e) {
    if (seekMouseDown == false && volMouseDown == false) return;
    if (currentlyPlaying === true) {
        if (seekMouseDown == true) {
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
            volP = volGetP(e);
            volFillBar.style.width = volP * 100 + '%';
            audio.volume = volP * 1
            currentVol = audio.volume;
        }
    }
});

window.addEventListener('mouseup', function (e) {
    if (seekMouseDown == false && volMouseDown == false) return;
    if (currentlyPlaying === true) {
        if (seekMouseDown == true) {
            seekMouseDown = false;
            seekP = seekGetP(e);
            seekFillBar.style.width = seekP * 100 + '%';
            audio.currentTime = seekP * audio.duration;
            seekBarTrack();
            $('#seekHandle').removeClass('handle-hover');
        }
        if (volMouseDown == true) {
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
});