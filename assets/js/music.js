/**
 * Audiation - An Open-source music player, built with Electron.
 * Copyright (c) projsh_ 2018
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
remote = require('electron').remote;
const {
    globalShortcut,
    dialog,
    app
} = require('electron').remote;
const path = require('path');

var os = require('os');
var fs = require('fs');
var id3 = require('jsmediatags');
var ipc = require('electron').ipcRenderer;
var drpc = require('discord-rpc');
var ver = '1.1b';

$('#audiationVer').text(`Audiation v.${ver}`);
$('#audiationVer').dblclick(function() {
    $('#openDevTools').show();
})
$('#volFill').css({
    width: '100%'
})

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
})

$(document).ready(function() {
    setTimeout(function() {
        $('#loadCover').css({
            opacity: 0
        })
        setTimeout(function() {
            $('#loadCover').hide();
            document.body.style.cursor = 'default'
        }, 250)
    }, 250);
})

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
        paddingTop: '15px'
    })
    $('.shadow-hide').css({
        top: '0'
    });
    $('#songsPage').css({
        height: 'calc(100% - 153px)'
    })
    $('#effectsMenu').css({
        top: 0,
        height: '100%'
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
        paddingTop: '35px'
    })
    $('.shadow-hide').css({
        top: '20px'
    });
    $('#songsPage').css({
        height: 'calc(100% - 173px)'
    })
    $('#effectsMenu').css({
        top: '22px',
        height: 'calc(100% - 22px)'
    })
}

$('.list-wrapper').html('<p style="text-align: center">Loading...');

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
    $('.results-link').css({
        color: '#fff'
    })
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

function loadFiles() {
    reloading = true;
    if (!fs.existsSync(`${os.homedir}/Music/Audiation`)) {
        fs.mkdirSync(`${os.homedir}/Music/Audiation`);
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
                $('.list-wrapper').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br><a class="open-file-browser">Click here</a> to open the Audiation folder.')
            } else {
                $('.list-wrapper').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br>Please add supported audio files to the folder.')
            }
            return $('.open-file-browser').click(function() {
                require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
            });
        }
        fileTotal = s.length - 1;
        $('.list-wrapper').html('');
        s.forEach((f, i) => {
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
            $('.list-wrapper').append(`<li class="results-link" id="${i}"><i class="material-icons play-pause" style="opacity: 0;">play_arrow</i><p class="new-song-title">${fileName}`);
            if (currentlyPlaying === true) {
                songActive();
            }
            /*$(`#${i}`).mouseover(function() {
                console.log(i)
            })*/
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
        });
        shuffleOrder = shuffle(allFilesList);
        allFilesList = fileSongListStore;
        shuffleOrder.forEach((f, i) => {
            shuffleList.push(fileSongListStore.indexOf(f));
        })
    });
    reloading = false;
}
loadFiles();
$('#openFileBrowser').click(function() {
    require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
});

$('#refreshFiles').click(function() {
    if (reloading == false) {
        $('.list-wrapper').html('<p style="text-align: center">Loading...');
        reloading = true
        setTimeout(loadFiles, 50)    
    }
});

function previousSong() {
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
    app.exit();
});

$('.tb-maximize').click(function() {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
});
var window = remote.getCurrentWindow();

window.addEventListener('blur', () => {
    $('.title-bar').css({
        background: '#222222'
    });
    $('.tb-button').css({
        opacity: .5
    })
})

window.addEventListener('focus', () => {
    $('.title-bar').css({
        background: '#1e1e1e'
    });
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
        /*case 116:
            dialog.showMessageBox(remote.getCurrentWindow(), {
                type: 'info',
                buttons: ['OK', 'Cancel'],
                title: 'Reload',
                message: 'Reloading will prevent media keys from functioning.'
            }, function (i) {
                if (i === 0) {
                    location.reload();
                }
            })*/
    }
});

if (process.platform != 'linux') {
    globalShortcut.register('MediaPlayPause', resumeButton);
    globalShortcut.register('MediaPreviousTrack', previousSong);
    globalShortcut.register('MediaNextTrack', nextSong);
}

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

$('#settingsButton').click(function() {
    $('#settings').show();
})

$("#settingsClose").click(function() {
    $("#settings").hide();
});

function navOpen() {
    $('#effectsMenu').show();
    setTimeout(() => {
        $('#effectsMenu').css({
            opacity: 1
        })
    }, 1);
}

function navClose() {
    $('#effectsMenu').css({
        opacity: 0
    })
    setTimeout(() => {
        $('#effectsMenu').hide();
    }, 250);
}

$('#effectsButton').click(function () {
    navOpen();
})

$('#effectsClose').click(function () {
    navClose();
});

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
                source.connect(gain).connect(audioCtx.destination);
            } else {
                audio.src = `${os.homedir}/Music/Audiation/${newFileChosen}`
            }
            audio.currentTime = 0;
            audio.play();
        } catch (err) {
            console.error(err);
            //dialog.showErrorBox('Error', err)
            audioStop();
        }
        audio.volume = currentVol;
        seekBarTrack();
        toolbarPause();
    } catch (err) {
        console.error(err.stack)
        currentlyPlaying = false;
        audioStop();
    }
}

var convolverGain = audioCtx.createGain();
var convolver = audioCtx.createConvolver();
var masterGain = audioCtx.createGain();
var masterCompression = audioCtx.createDynamicsCompressor();

function impulseGet() {
    convolver = audioCtx.createConvolver();
    ajaxRequest = new XMLHttpRequest();
    ajaxRequest.open('GET', './assets/impulse/SteinmanHall.wav', true);
    ajaxRequest.responseType = 'arraybuffer';
    ajaxRequest.onload = function () {
        var impulseData = ajaxRequest.response;
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
$('#reverbEnable').click(function() {
    switch(reverbEnabled) {
        case false:
            source.connect(convolverGain);
            source.connect(masterGain);
            masterGain.connect(masterCompression);
            masterCompression.connect(audioCtx.destination);
            impulseGet();
            convolver.disconnect();
            $(this).text('Disable')
            reverbEnabled = true;
            break;
        case true:
            masterCompression.disconnect(audioCtx.destination);
            $(this).text('Enable')
            reverbEnabled = false;
    }
})

var gainInput = 1;
$('#gainInput').change(function() {
    if ($(this).val() >= 100) $(this).val(100);
    if ($(this).val() <= 0) $(this).val(0);
    gainInput = $(this).val();
    gain.gain.value = gainInput;
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

var tabSection = 'songs'
$('.top-bar h2').click(function() {
    $(`#${tabSection}Page`).removeClass('active-tab');
    tabSection = $(this).attr('id').substr(0, $(this).attr('id').length - 3);
    $(`#${tabSection}Page`).addClass('active-tab');
    $('.top-bar h2').removeClass('tab-active');
    $(this).addClass('tab-active')
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
            ipc.send('playbackstatus', 'Paused');
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
            ipc.send('mprisplaybackstatus', 'Playing');
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

$('#volWrapper').mouseover(function() {
    if (currentlyPlaying === true) {
        $('#volHandle').addClass('handle-hover');
    }
})

$('#volWrapper').mouseleave(function() {
    if (currentlyPlaying === true) {
        if (!volMouseDown === false) return;
        $('#volHandle').removeClass('handle-hover');
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

function seekBarTrack() {
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
                    albumArt = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                    document.getElementById('songPicture').style.background = `url(${albumArt})`
                    document.getElementById('songPictureBlur').style.background = `url(${albumArt})`

                } else {
                    document.getElementById('songPicture').style.background = 'url(assets/svg/no_image.svg)';
                    document.getElementById('songPictureBlur').style.background = 'url(assets/svg/no_image.svg)';
                    albumArt = 'assets/svg/no_image.svg'
                }
                $('h1#songTitle').text(Title);
                $('#artist').text(`${artist}`);
                if (!tag.tags.artist) {
                    $('title').text(`${newFileName}`);
                } else {
                    $('title').text(`${artist} - ${Title}`)
                }

                //Update mpris stuff
                ipc.send('mpris-update', ["metadata", {
                    'xesam:title': Title,
                    'xesam:artist': artist,
                    'xesam:album': album,
                    'mpris:artURL': albumArt
                }]);
                ipc.send('mpris-update', ["playbackStatus", "Playing"]);
                var tagInfo = {
                    'title': Title,
                    'artist': artist,
                    'album': album,
                    'art': albumArt
                }
                ipc.send('tag-info', tagInfo)
            },
            onError: function (tag) {
                $('#songTitle').text(newFileName);
                $('#artist').text('Unknown Artist');
                document.getElementById('songPicture').style.background = 'url(assets/svg/no_image.svg)';
                document.getElementById('songPictureBlur').style.background = 'url(assets/svg/no_image.svg)';
                $('title').text(`${newFileName}`);
                Title = newFileName;
                artist = 'Unknown Artist'
                album = 'Unknown Album'
                var tagInfo = {
                    'title': newFileName,
                    'artist': 'Unknown Artist',
                    'album': 'Unknown Album',
                    'art': 'assets/svg/no_image.svg'
                }
                ipc.send('tag-info', tagInfo)
            }
        })
    audio.addEventListener('timeupdate', seekTimeUpdate);
}

var clientId = '535619653762940948';
const rpc = new drpc.Client({ transport: 'ipc' })

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
})

rpc.login({ clientId }).catch(console.error)

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

function seekGetP(e) {
    seekP = (e.clientX - seekBar.offsetLeft) / seekBar.clientWidth;
    seekP = clamp(0, seekP, 1);
    return seekP;
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
    }
});
var volNum = 8;
var volDec = .8;
var volMuteCon = false;
upDownVol();

function upDownVol() {
    if (volNum == 1) {
        muteSaveVol = 0.1;
    }
    if (volNum == 11) volNum = volNum - 1;
    if (volNum == -1) {
        volNum = volNum + 1;
    }
    if (volNum == 10) {
        volDec = 1;
    } else {
        volDec = parseFloat(`0.${volNum}`);
    }
    if (audio) {
        audio.volume = volDec;
    }
    $('.vol-box').css({
        background: '#3d3d3d'
    })
    for (i = 0; i < volNum; i++) {
        $(`#vol${i + 1}`).css({
            background: '#9a07df'
        })
    };
    currentVol = volDec;
}
$('.vol-box').mousedown(function() {
    if (isMuted == true) {
        muteButton()
    }
    volNum = $(this).attr('id').substr(3);
    upDownVol();
})

$('#volWrapper').mouseover(function() {
    $('.vol-bar').css({
        bottom: '11px'
    });
    /*$('.plus-minus').show();
    $('.plus-minus').css({
        opacity: 1
    })*/
    $('.vol-box').addClass('vol-change')
})

$('#volWrapper').mouseleave(function() {
    $('.vol-bar').css({
        bottom: '0'
    })
    /*$('.plus-minus').css({
        opacity: 0
    })
    setTimeout(() => {
        $('.plus-minus').hide();
    }, 200)*/
    $('.vol-box').removeClass('vol-change')
})

$('#volUp').click(function() {
    if (volNum == 0) {
        muteButton();
    } else {
        volNum++;
    }
    upDownVol();
})

$('#volDown').click(function() {
    if (volNum == 1) {
        muteButton()
    }
    volNum = volNum - 1;
    upDownVol();
})
var mutedFromButton = false;
$('#volumeButton').click(function() {
    muteButton();
})

function muteButton() {
    switch (isMuted) {
        case false:
            isMuted = true;
            if (volNum == 10) {
                muteSaveVol = 10;
            } else {
                muteSaveVol = parseInt(`${audio.volume}`.substr(2));
            }            
            volNum = 0;
            $('#volumeButton').text('volume_off');
            upDownVol();
            break;
        case true:
            volNum = muteSaveVol;
            $('#volumeButton').text('volume_up');
            upDownVol();
            isMuted = false;
    }
}