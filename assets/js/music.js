/**
 * Audiation - An Open-source music player, built with Electron.
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
 * Original Repo: https://github.com/projsh/audiation
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
remote = require('electron').remote;
const {
    globalShortcut,
    dialog,
    app
} = require('electron').remote;
const path = require('path');
var os = require('os');
var fs = require('fs-extra');
var id3 = require('jsmediatags');
var ipc = require('electron').ipcRenderer;
var drpc = require('discord-rpc');
var settings = require('electron-settings')
var ver = '0.2.2';

if (process.platform == 'linux') {
    var mpris = require('mpris-service');
    var mprisPlayer = new mpris({
        name: 'audiation',
        identity: 'Audiation',
        supportedInterfaces: ['player']
    });
}

$('#audiationVer').text(`v.${ver}`);
$('#audiationVer').dblclick(function() {
    $('#openDevTools').show();
})
$('#volFill').css({
    width: '100%'
})

if (settings.has('theme') == false) {
    settings.set('theme', 'dark')
}

if (settings.get('theme') == 'light') {
    theme = 'light';
    $('html').addClass('light');
    $('#lightSwitch').prop('checked', true);
    $('#miniBgSwitch').prop('checked', false);
    $('#miniBgSwitch').prop('disabled', true);
    $('#miniBgSwitch').parent().addClass('switch-disabled');
}

if (settings.get('mini-player-bg') == false) {
    ipc.send('mini-bg', false)
    $('#miniBgSwitch').prop('checked', false)
}

var clientId = '535619653762940948';
const rpc = new drpc.Client({ transport: 'ipc' })

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
            largeImageText: 'Audiation',
            state: artist
        });
    }
    
    rpc.on('ready', () => {
        rpcSetActivity();
        setInterval(() => {
            rpcSetActivity();
        }, 2500)
    });
    
    rpc.login({ clientId }).catch(console.error);
    $('#discordSwitch').prop('checked', true);
    console.log('Discord RPC has been enabled.')
}

if (process.platform == 'linux') {
    mprisPlayer.on('playpause', (event, arg) => {
        resumeButton()
    });
    mprisPlayer.on("play", (event, arg) => {
        resumeButton();
    });
    mprisPlayer.on("pause", (event, arg) => {
        resumeButton();
    });
    mprisPlayer.on("next", (event, arg) => {
        nextSong();
    })
    mprisPlayer.on("previous", (event, arg) => {
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
})

$(document).ready(function() {
    setTimeout(function() {
        $('#loadCover').css({
            opacity: 0
        });
        $('.main-content').css({
            transform: 'scale(1)'
        })
        setTimeout(function() {
            $('#loadCover').hide();
            document.body.style.cursor = 'default'
        }, 250)
    }, 500);
});

if (theme == 'light') {
    document.getElementById('songPicture').style.background = 'url(assets/svg/no_image_light.svg)';
    document.getElementById('songPictureBlur').style.background = 'url(assets/svg/no_image_light.svg)';
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
    })
    $('.shadow-hide').css({
        top: '0'
    });
    $('#songsPage').css({
        height: 'calc(100% - 140px)'
    })
    $('.menu').css({
        top: 0,
        height: '100%'
    })
    $('.play-type-wrapper').css({
        height: 'calc(100% - 169px)'
    })
    $('.logo-bottom').css({
        top: '6px'
    })
    $('.cover-top').css({
        top: '-20px'
    })
}

if (process.platform === 'darwin') {
    $('.title-bar').css({
        height: '20px'
    })
    $('.app-content').css({
        marginTop: '50px'
    });
    $('.top-bar').css({
        top: '20px'
    });
    $('#playType').css({
        paddingTop: '72px'
    })
    $('.shadow-hide').css({
        top: '20px'
    });
    $('#songsPage').css({
        height: 'calc(100% - 158px)'
    })
    $('.menu').css({
        top: '22px',
        height: 'calc(100% - 22px)'
    })
    $('.play-type-wrapper').css({
        height: 'calc(100% - 189px)'
    })
    $('.logo-bottom').css({
        top: '26px'
    })
    $('.cover-top').css({
        top: '-20px'
    })
}

$('.list-wrapper').html('<p style="text-align: center; font-weight: bold; margin-left: 150px;">Loading...');

remote.getCurrentWindow().setMinimumSize(720, 525);
document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())
document.querySelector('img').draggable = false;

function songActive() {
    $(`#${highlightSong}`).css({
        color: '#c464f1'
    })
    $(`#${highlightSong} i`).css({
        opacity: 1
    })
    if (pauseButtonActive === false) {
        $(`#${highlightSong} i`).text('volume_up');
    } else {
        $(`#${highlightSong} i`).text('play_arrow');
    }
    shuffleWait = false;
}

function toolbarPlay() {
    remote.getCurrentWindow().setThumbarButtons([{
            tooltip: 'Previous',
            icon: path.join(__dirname, '/assets/image/skipprevious_white.png'),
            click() {
                previousSong()
            }
        },
        {
            tooltip: 'Play',
            icon: path.join(__dirname, '/assets/image/play_arrow_white.png'),
            click() {
                resumeButton();
            }
        },
        {
            tooltip: 'Skip',
            icon: path.join(__dirname, '/assets/image/skipnext_white.png'),
            click() {
                nextSong()
            }
        }
    ])
}

function toolbarPause() {
    remote.getCurrentWindow().setThumbarButtons([{
            tooltip: 'Previous',
            icon: path.join(__dirname, '/assets/image/skipprevious_white.png'),
            click() {
                previousSong()
            }
        },
        {
            tooltip: 'Pause',
            icon: path.join(__dirname, '/assets/image/pause_white.png'),
            click() {
                resumeButton();
            }
        },
        {
            tooltip: 'Skip',
            icon: path.join(__dirname, '/assets/image/skipnext_white.png'),
            click() {
                nextSong()
            }
        }
    ])
}

toolbarPlay();

function songActiveReset() {
    $('.play-pause').text('play_arrow');
    $(`.play-pause`).css({
        opacity: 0
    })
    if (theme == 'light') {
        $('.results-link').css({
            color: '#3d3d3d'
        })
    } else {
        $('.results-link').css({
            color: '#fff'
        })
    }
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

var fileextentions = ['mp3', 'm4a', 'wav', 'ogg', '3gp', 'aac', 'flac', 'webm', 'raw']
var reloading;
var ctxMenu;
var xPosition;
var yPosition;
var playlistList = {};
var clickedSong;
var tab = 'songs';
function loadFiles() {
    reloading = true;
    if (!fs.existsSync(`${os.homedir}/Music/Audiation`)) {
        fs.mkdirSync(`${os.homedir}/Music/Audiation`);
    }
    if (!fs.existsSync(`${app.getPath('userData')}/playlists.json`)) {
        fs.writeJson(`${app.getPath('userData')}/playlists.json`, ({
            'playlist1': []
        }), err => {
            if (err) return console.error(err)
        });
    } else {
        fs.readJson(`${app.getPath('userData')}/playlists.json`, (err, file) => {
            playlistList = file.playlist1;
        });
    }
    s = [];
    allFilesList = [];
    shuffleOrder = [];
    fileSongListStore = [];
    shuffleList = [];
    fs.readdir(`${os.homedir}/Music/Audiation`, (err, files) => {
        if (err) console.error(err);
        fileextentions.forEach((e) => {
            sortFileExt[e] = files.filter(f => f.split(".").pop() === e);
            s = s.concat(sortFileExt[e]);
            s.sort(function (a, b) {
                if (a.toLowerCase() < b.toLowerCase()) return -1;
                if (a.toLowerCase() > b.toLowerCase()) return 1;
                return 0;
            });
        });
        if (s.length === 0) {
            if (process.platform === 'win32') {
                $('.list-wrapper').html('<p style="text-align: center; font-weight: bold; margin-left: 175px;">No valid audio files found in the Audiation folder.<br><a class="open-file-browser">Click here</a> to open the Audiation folder.')
            } else {
                $('.list-wrapper').html('<p style="text-align: center; font-weight: bold; margin-left: 175px;">No valid audio files found in the Audiation folder.<br>Please add supported audio files to the folder.')
            }
            return $('.open-file-browser').click(function() {
                require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
            });
        }
        fileTotal = s.length - 1;
        $('.list-wrapper').html('');
        if (tab == 'songs') {
            s.forEach((f, i) => {
                forEachFile(f, i);
            });
        }
        if (tab == 'playlists') {
            $(`#${tab}Page .list-wrapper`).append(`<div class="warning-wrap"><p class="warning-message">This feature is very new and incomplete. It's currently very basic and broken.</p><div id="clearPlaylists">CLEAR PLAYLIST</div></div>`)
            $('#clearPlaylists').click(() => {
                playlistList = [];
                fs.writeJson(`${app.getPath('userData')}/playlists.json`, ({'playlist1': []}) , err => {
                    if (err) return console.error(err)
                });
                $('#libraryButton').click();
            })
            playlistList.forEach((f, i) => {
                forEachFile(f, i);
            });
        }
        $('body').on("contextmenu", "li.results-link", function(e) {
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
        shuffleOrder = shuffle(allFilesList);
        allFilesList = fileSongListStore;
        shuffleOrder.forEach((f, i) => {
            shuffleList.push(fileSongListStore.indexOf(f));
        });
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
    });
    reloading = false;
}

function forEachFile(f, i) {
    function playSong() {
        currentSongPlaying = i;
        highlightSong = i;
        songActiveReset();
        newFileChosen = f;
        newFileName = f.slice(0, -fName[fName.length - 1].length - 1);
        if (currentlyPlaying === true) {
            audioStop();
        }
        $('#pauseButton').text('pause')
        findSong();
        songActive();
    }
    fileSongListStore.push(f);
    allFilesList.push(f);
    fName = f.split('.');
    fileName = f.slice(0, -fName[fName.length - 1].length - 1);
    $(`#${tab}Page .list-wrapper`).append(`<li draggable="true" class="results-link" id="${i}"><i class="material-icons play-pause" style="opacity: 0;">play_arrow</i><p class="new-song-title">${fileName}`);
    $(`#${i} p`).dblclick(function() {
        shuffleCheck = false;
        if (shuffleEnabled == true) {
            shuffleCheck = true;
            shuffleEnableFirst = true;
        }
        playSong();
    });
    $(`#${i} i`).click(function() {
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
    $(`#${i}`).mouseover(function() {
        $(`#${i} i`).css({
            opacity: 1,
        })
    })
    $(`#${i} i`).mouseover(function() {
        if (highlightSong == i && pauseButtonActive == false) {
            $(`#${i} i`).text('pause');
        }
    })
    $(`#${i}`).mouseleave(function() {
        if (highlightSong !== i) {
            $(`#${i} i`).css({
                opacity: 0
            })
            $(`#${i} i`).text('play_arrow');
        }
    })
    $(`#${i} i`).mouseleave(function() {
        if (highlightSong == i) {
            $(`#${i} i`).css({
                opacity: 1,
            })
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

loadFiles();
$('#openFileBrowser').click(function() {
    require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
});

var addSong;
$('#addSongPlaylist').click(() => {
    addSong = fileSongListStore[clickedSong];
    if (playlistList.indexOf(addSong) != -1) return;
    playlistList.push(addSong);
    fs.writeJson(`${app.getPath('userData')}/playlists.json`, ({'playlist1': playlistList}) , err => {
        if (err) return console.error(err)
    });
})

$('#refreshFiles').click(function() {
    if (reloading == false) {
        $('.list-wrapper').html('<p style="text-align: center; font-weight: bold; margin-left: 150px;">Loading...');
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
    newFileName = newFileChosen.slice(0, -fName[fName.length -1].length - 1);
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
    newFileName = newFileChosen.slice(0, -fName[fName.length -1].length - 1);
    if (shuffleEnabled == true) {
        highlightSong = shuffleList[currentSongPlaying];
    } else {
        highlightSong = currentSongPlaying;
    }
    if (noSong == true) {
        currentSongPlaying = 0;
        highlightSong = 0;
        newFileChosen = allFilesList[currentSongPlaying];
        newFileName = newFileChosen.slice(0, -fName[fName.length -1].length - 1); 
        noSong = false;   
    }
    $(`#${highlightSong} i`).text('volume_up');
    $('#pauseButton').text('pause')
    songActive();
    findSong();
    ipc.send('play-mini')
}

$('#backwardButton').click(function() {
    if (currentSongPlaying === allFilesList[0]) {
        audioStop();
    } else {
        previousSong();
    }
})

$('#forwardButton').click(function() {
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
                color: '#fff'
            });
            shuffleWait = true;
            shuffleEnableFirst = false;
            shuffleDisableFirst = true;
            break;
        case false:
            shuffleEnabled = true;
            $('#shuffleButton').css({
                color: '#c464f1'
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
                color: '#fff'
            });

            break;
        case false:
            repeatEnabled = true;
            $('#repeatButton').css({
                color: '#c464f1'
            });
            shuffleEnableFirst = false;
    }
    ipc.send('repeat-enable')
}

$('#repeatButton').click(function() {
    enableRepeat()
});

$('#shuffleButton').click(function() {
    enableShuffle()
})

$('.tb-close').click(function() {
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

$('.tb-maximize').click(function() {
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

$('.tb-minimize').click(function() {
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

var menuOpened;

function navOpen() {
    menuOpen = true;
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
    }, 250);
}

$('#effectsButton, #settingsButton').click(function () {
    menuOpened = this.id.substr(0, this.id.length - 6);
    navOpen();
})

$('#effectsClose, #settingsClose').click(function () {
    navClose();
    setTimeout(() => {
        $(`#${getSubId}, .menu-first, .menu-heading, .menu-arrow, .submenu-title, .mtitle-button`).removeClass('hidden');
    }, 250)
});

var restartRequired = false;

$('#lightSwitch').click(() => {
    if (settings.get('theme') == 'light') {
        settings.set('theme', 'dark');
        if (settings.get('mini-player-bg') == false) {
            $('#miniBgSwitch').prop('checked', false);
        } else {
            $('#miniBgSwitch').prop('checked', true);
        }
        $('#miniBgSwitch').prop('disabled', false);
        $('#miniBgSwitch').parent().removeClass('switch-disabled');
    } else {
        settings.set('theme', 'light');
        $('#miniBgSwitch').prop('checked', false);
        $('#miniBgSwitch').prop('disabled', true);
        $('#miniBgSwitch').parent().addClass('switch-disabled');
    }
    $('.restart-container').css('bottom', 0);
    restartRequired = true;
})

$('#discordSwitch').click(() => {
    if (settings.get('discordrpc') == true) {
        settings.set('discordrpc', false)
    } else {
        settings.set('discordrpc', true)
    }
    $('.restart-container').css('bottom', 0);
    restartRequired = true;
});

$('#miniBgSwitch').click(() => {
    if (settings.get('mini-player-bg') == true) {
        settings.set('mini-player-bg', false);
        ipc.send('mini-bg', false);
    } else {
        settings.set('mini-player-bg', true);
        ipc.send('mini-bg', true);
    }
})

var subMenuList = {
    'appearanceSubButton': 'appearanceSubmenu'
}
var getSubId;
$('.menu-submenu-button').click(function() {
    getSubId = $(this).attr('id');
    getSubId = subMenuList[getSubId];
    $(`#${getSubId}, .menu-first, .menu-heading, .menu-arrow, .submenu-title, .mtitle-button`).addClass('hidden');
})

$('.mtitle-button').click(() => {
    $(`#${getSubId}, .menu-first, .menu-heading, .menu-arrow, .submenu-title, .mtitle-button`).removeClass('hidden');
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
                audio = new Audio(`${os.homedir}/Music/Audiation/${newFileChosen}`);
                source = audioCtx.createMediaElementSource(audio);
                gain = audioCtx.createGain();
                source.connect(gain).connect(audioCtx.destination)
            } else {
                audio.src = `${os.homedir}/Music/Audiation/${newFileChosen}`
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
            console.error(err);
            //dialog.showErrorBox('Error', err)
            audioStop();
        }
        getSongInfo();
        audio.volume = currentVol;
        seekBarTrack();
        toolbarPause();
    } catch (err) {
        console.error(err.stack)
        currentlyPlaying = false;
        audioStop();
    }
}

function getSongInfo() {
    new id3.Reader(`${os.homedir}/Music/Audiation/${newFileChosen}`)
        .setTagsToRead(['title', 'artist', 'picture', 'album'])
        .read({
            onSuccess: function (tag) {
                artist = tag.tags.artist;
                Title = tag.tags.title;
                album = tag.tags.album;
                newTags = tag;
                if (!tag.tags.artist) {
                    artist = 'Unknown Artist'
                }
                if (!tag.tags.album) {
                    album = 'Unknown Album'
                }
                if (!tag.tags.title) {
                    Title = newFileName;
                }
                var base64String = '';
                if (tag.tags.picture) {
                    for (var i = 0; i < tag.tags.picture.data.length; i++) {
                        base64String += String.fromCharCode(tag.tags.picture.data[i]);
                    }
                    dataUrl = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                    if (process.platform == 'linux') {
                        tmpFile = tmp.tmpNameSync({template: 'tmp-XXXXXX'});
                        fs.writeFile(`${tmpobj.name}/${tmpFile}.jpg`, btoa(base64String), 'base64', function(err) {
                            if (err) console.error(err);
                            albumArt = `${tmpobj.name}/${tmpFile}.jpg`;
                            document.getElementById('songPicture').style.background = `url(${albumArt})`
                            document.getElementById('songPictureBlur').style.background = `url(${albumArt})`
                        })
                    } else {
                        albumArt = dataUrl
                        document.getElementById('songPicture').style.background = `url(${albumArt})`
                        document.getElementById('songPictureBlur').style.background = `url(${albumArt})`
                    }
                } else {
                    if (theme == 'light') {
                        document.getElementById('songPicture').style.background = 'url(assets/svg/no_image_light.svg)';
                        document.getElementById('songPictureBlur').style.background = 'url(assets/svg/no_image_light.svg)';
                        albumArt = 'assets/svg/no_image_light.svg';
                        dataUrl = 'assets/svg/no_image_light.svg'
                    } else {
                        document.getElementById('songPicture').style.background = 'url(assets/svg/no_image.svg)';
                        document.getElementById('songPictureBlur').style.background = 'url(assets/svg/no_image.svg)';
                        albumArt = 'assets/svg/no_image.svg'
                        dataUrl = 'assets/svg/no_image.svg'
                    }
                }
                $('h1#songTitle').text(Title);
                $('#artist').text(`${artist}`);
                if (!tag.tags.artist) {
                    $('title').text(`${newFileName}`);
                } else {
                    $('title').text(`${artist} - ${Title}`)
                }
                if (process.platform == 'linux') {
                    mprisPlayer.metadata =  {
                        'xesam:title': Title,
                        'xesam:artist': artist,
                        'xesam:album': album,
                        'mpris:trackid': mprisPlayer.objectPath('track/0'),
                        'mpris:artUrl': `file://${tmpobj.name}/${tmpFile}.jpg`
                    };
                    mprisPlayer.playbackStatus = 'Playing';
                }
                var tagInfo = {
                    'title': Title,
                    'artist': artist,
                    'album': album,
                    'art': dataUrl
                }
                ipc.send('tag-info', tagInfo);
            },
            onError: function (tag) {
                $('#songTitle').text(newFileName);
                $('#artist').text('Unknown Artist');
                var testLight = 'assets/svg/no_image.svg';
                if (theme == 'light') {
                    document.getElementById('songPicture').style.background = 'url(assets/svg/no_image_light.svg)';
                    document.getElementById('songPictureBlur').style.background = 'url(assets/svg/no_image_light.svg)';
                    testLight = 'assets/svg/no_image_light.svg'
                } else {
                    document.getElementById('songPicture').style.background = 'url(assets/svg/no_image.svg)';
                    document.getElementById('songPictureBlur').style.background = 'url(assets/svg/no_image.svg)';
                    testLight = 'assets/svg/no_image.svg'
                }
                $('title').text(`${newFileName}`);
                Title = newFileName;
                artist = 'Unknown Artist'
                album = 'Unknown Album';
                if (process.platform == 'linux') {
                    mprisPlayer.metadata =  {
                        'xesam:title': Title,
                        'xesam:artist': artist,
                        'xesam:album': album,
                        'mpris:trackid': mprisPlayer.objectPath('track/0'),
                        'mpris:artUrl': ''
                    };
                    mprisPlayer.playbackStatus = 'Playing';
                }
                var tagInfo = {
                    'title': newFileName,
                    'artist': 'Unknown Artist',
                    'album': 'Unknown Album',
                    'art': testLight
                }
                ipc.send('tag-info', tagInfo)
            }
    })
}

var convolverGain = audioCtx.createGain();
var convolver = audioCtx.createConvolver();
var masterGain = audioCtx.createGain();
var masterCompression = audioCtx.createDynamicsCompressor();
var impulseData = [];

function impulseGet() {
    convolver = audioCtx.createConvolver();
    ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open('GET', './assets/impulse/SteinmanHall.wav', true);
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
$('#reverbSwitch').click(function() {
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
    switch(gainEnabled) {
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
$('#gainInput').change(function() {
    if ($(this).val() >= 100) $(this).val(100);
    if ($(this).val() <= 0) $(this).val(0);
    gainInput = $(this).val();
    if (gainEnabled == true) {
        gain.gain.value = gainInput;
    }
})

var reverbInput = 1;
$('#reverbInput').change(function() {
    if ($(this).val() >= 100) $(this).val(100);
    if ($(this).val() <= 0) $(this).val(0);
    reverbInput = $(this).val();
    convolverGain.gain.value = reverbInput;
})

$('#openDevTools').click(function() {
    var remote = require('electron').remote;
    remote.getCurrentWindow().toggleDevTools();
})

$('#pauseButton').click(function() {
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
    loadFiles();
    buttonActive('libraryButton');
})

$('.top-bar h2, #playlistsTab').click(function() {
    $(`#${tabSection}Page`).removeClass('active-tab');
    tabSection = $(this).attr('id').substr(0, $(this).attr('id').length - 3);
    $(`#${tabSection}Page`).addClass('active-tab');
    if ($(this).attr('id') == 'playlistsTab') {
        tab = 'playlists';
        loadFiles();
        buttonActive('playlistsTab');
        $('.top-bar h2').hide();
    } else {
        $('.top-bar h2').removeClass('tab-active');
        $(this).addClass('tab-active')
    }
})

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
            $('title').text('Audiation');
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

$('#seekWrapper').mouseover(function() {
    if (currentlyPlaying === true) {
        $('#seekHandle').addClass('handle-hover');
    }
})

$('#seekWrapper').mouseleave(function() {
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
    switch(isMuted) {
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
    clearTempFiles()
    setTimeout(() => {
        app.quit();
    }, 500)
}

window.onbeforeunload = (i) => {
    if (process.platform == 'linux') {
        appExit();
    }
}

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
            $('#seekHandle').removeClass('handle-hover');
            seekBarTrack();
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
            $('#volHandle').removeClass('handle-hover');
            if (isMuted == true && audio.volume != 0) {
                isMuted = false;
                $('#volumeButton').text('volume_up');
            }
        }
    }
});