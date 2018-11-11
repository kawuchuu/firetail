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

var os = require('os');
var fs = require('fs');
var id3 = require('jsmediatags');
var ipc = require('electron').ipcRenderer;
var ver = '1.0b';
$('#audiationVer').text(`Audiation v.${ver}`);
$('#volFill').css({width: '100%'})

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
//TODO: implement the rest of the events

$(document).ready(function () {
    setTimeout(function () {
        $('#loadCover').css({
            opacity: 0
        })
        setTimeout(function () {
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
        marginTop: '20px'
    });
    $('#newContentWrapper h1').css({
        top: '0'
    });
    $('#playType').css({
        paddingTop: '15px'
    })
    $('.shadow-hide').css({
        top: '0'
    });
}

if (process.platform === 'darwin') {
    $('.title-bar').css({
        height: '20px'
    })
    $('.app-content').css({
        marginTop: '55px'
    });
    $('#newContentWrapper h1').css({
        top: '20px'
    });
    $('#playType').css({
        paddingTop: '35px'
    })
    $('.shadow-hide').css({
        top: '20px'
    })
}

$('#newList').html('<p style="text-align: center">Loading...');

remote = require('electron').remote;
const {globalShortcut, dialog} = require('electron').remote;
const path = require('path');
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
    remote.getCurrentWindow().setThumbarButtons([
        {
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
    remote.getCurrentWindow().setThumbarButtons([
        {
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

function loadFiles() {
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
            s.sort(function(a, b) {
                if (a.toLowerCase() < b.toLowerCase()) return -1;
                if (a.toLowerCase() > b.toLowerCase()) return 1;
                return 0;
            });
        });
        if (s.length === 0) {
            if (process.platform === 'win32') {
                $('#newList').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br><a class="open-file-browser">Click here</a> to open the Audiation folder.')
            } else {
                $('#newList').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br>Please add supported audio files to the folder.')
            }
            return $('.open-file-browser').click(function () {
                require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
            });
        }
        fileTotal = s.length - 1;
        $('#newList').html('');
        s.forEach((f, i) => {
            fileSongListStore.push(f);
            allFilesList.push(f);
            fName = f.split('.');
            fileName = f.slice(0, -fName[fName.length - 1].length - 1);
            $('#newList').append(`<li class="results-link" id="${i}"><i class="material-icons play-pause" style="opacity: 0;">play_arrow</i><p class="new-song-title">${fileName}`);
            if (currentlyPlaying === true) {
                songActive();
            }
            $(`#${i}`).click(function () {
                shuffleCheck = false;
                if (shuffleEnabled == true) {
                    shuffleCheck = true;
                    shuffleEnableFirst = true;
                }
                if (currentlyPlaying === true && $(this).attr('id') === `#${highlightSong}`.substr(1)) {
                    resumeButton();
                } else {
                    currentSongPlaying = i;
                    highlightSong = i;
                    songActiveReset();
                    newFileChosen = f;
                    newFileName = f.slice(0, -4)
                    if (currentlyPlaying === true) {
                        audioStop();
                    }
                    findSong();
                    songActive();
                    if (document.getElementById(i).mouseover == false) {
                        $(`#${highlightSong} i`).text('volume_up');
                    } else {
                        $(`#${highlightSong} i`).text('pause');
                    }
                    $('#pauseButton').text('pause') 
                }
            });
            $(`#${i}`).mouseover(function () {
                $(`#${i} i`).css({
                    opacity: 1,
                })
                if (checkForShuffle == false && currentSongPlaying == i && pauseButtonActive == false || checkForShuffle == true && shuffleList[currentSongPlaying] == i && pauseButtonActive == false) {
                    $(`#${i} i`).text('pause');
                }
            })
            $(`#${i}`).mouseleave(function () {
                if (checkForShuffle == true && shuffleCheck == false && shuffleWait == true) {
                    if (shuffleList[currentSongPlaying] == i) {
                        $(`#${i} i`).css({
                            opacity: 1,
                        })
                        if (pauseButtonActive == false) {
                            $(`#${i} i`).text('volume_up')
                        }
                    } else {
                        $(`#${i} i`).css({
                            opacity: 0
                        })
                        $(`#${i} i`).text('play_arrow');
                    }
                } else {
                    if (highlightSong == i) {
                        $(`#${i} i`).css({
                            opacity: 1,
                        })
                        if (pauseButtonActive == false) {
                            $(`#${i} i`).text('volume_up')
                        }
                    } else {
                        $(`#${i} i`).css({
                            opacity: 0
                        })
                        $(`#${i} i`).text('play_arrow');
                    }
                }
            })
        })
        shuffleOrder = shuffle(allFilesList);
        allFilesList = fileSongListStore;
        shuffleOrder.forEach((f, i) => {
            shuffleList.push(fileSongListStore.indexOf(f));
        })
    })
}
loadFiles();
$('#openFileBrowser').click(function () {
    require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
});

$('#refreshFiles').click(function () {
    $('#newList').html('<p style="text-align: center">Loading...');
    setTimeout(loadFiles, 50)
})

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
    newFileName = newFileChosen.slice(0, -4);
    if (shuffleEnabled == true) {
        highlightSong = shuffleList[currentSongPlaying];
    } else {
        highlightSong = currentSongPlaying;
    }
    $(`#${highlightSong} i`).text('volume_up');
    $('#pauseButton').text('pause') 
    songActive();
    findSong();
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
    newFileName = newFileChosen.slice(0, -4);
    if (shuffleEnabled == true) {
        highlightSong = shuffleList[currentSongPlaying];
    } else {
        highlightSong = currentSongPlaying;
    }
    $(`#${highlightSong} i`).text('volume_up');
    $('#pauseButton').text('pause') 
    songActive();
    findSong();
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

$('#repeatButton').click(function () {
    switch (repeatEnabled) {
        case true:
            repeatEnabled = false;
            $(this).css({
                color: '#fff'
            });
            
            break;
        case false:
            repeatEnabled = true;
            $(this).css({
                color: '#c464f1'
            });
        shuffleEnableFirst = false;
    }
});

$('#shuffleButton').click(function () {
    switch (shuffleEnabled) {
        case true:
            shuffleEnabled = false;
            $(this).css({
                color: '#fff'
            });
            shuffleWait = true;
            shuffleEnableFirst = false;
            shuffleDisableFirst = true;
            break;
        case false:
            shuffleEnabled = true;
            $(this).css({
                color: '#c464f1'
            });
            shuffleWait = true;
            shuffleEnableFirst = true;
            shuffleDisableFirst = false;
    }
})

$('.tb-close').click(function () {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.close();
});

$('.tb-maximize').click(function () {
    const remote = require('electron').remote;
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
        background: 'rgb(27,27,27)'
    });
    $('.tb-button').css({
        opacity: 1
    })
})

$('.tb-minimize').click(function () {
    const remote = require('electron').remote;
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
        case 116:
            dialog.showMessageBox(remote.getCurrentWindow(), {
                type: 'info',
                buttons: ['OK', 'Cancel'],
                title: 'Reload',
                message: 'Reloading will prevent media keys from functioning.'
            }, function(i) {
                if (i === 0) {
                    location.reload();
                }
            })
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

$('#settingsButton').click(function () {
    $('#settings').show();
})

$("#settingsClose").click(function () {
    $("#settings").hide();
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

function findSong() {
    try {
        if (audio) {
            audio.removeEventListener('timeupdate', seekTimeUpdate);
        }
        $('.new-nowplaying').addClass('np-active');
        currentlyPlaying = true;
        noSongPlaying();
        try {
            audio = new Audio(`${os.homedir}/Music/Audiation/${newFileChosen}`);
            audio.currentTime = 0;
            audio.play()
        } catch (err) {
            console.error(err);
            dialog.showErrorBox('Error', err)
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

$('#openDevTools').click(function () {
    var remote = require('electron').remote;
    remote.getCurrentWindow().toggleDevTools();
})

$('#pauseButton').click(function () {
    resumeButton()
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

function resumeButton() {
    if (currentlyPlaying == false) {
        pauseButtonActive = true;
        currentSongPlaying = 0;
        highlightSong = 0;
        newFileChosen = allFilesList[0];
        newFileName = newFileChosen.slice(0, -4);
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
            break;
        case true:
            pauseButtonActive = false;
            audio.play();
            if (document.getElementById(highlightSong).mouseover == true) {
                $(`#${highlightSong} i`).text('pause');
            } else {
                $(`#${highlightSong} i`).text('volume_up');
            }
            if (document.getElementById(highlightSong).mouseover == false) {
                $(`#${highlightSong} i`).text('volume_up');
            }
            $('#pauseButton').text('pause')
            toolbarPause();
            if (artist == "Unknown Artist") {
                $('title').text(`${newFileName}`);
            } else {
                $('title').text(`${artist} - ${Title}`)
            }
            toolbarPause();
            ipc.send('playbackstatus', 'Playing');
    }
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
    }
}

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
                    document.getElementById('songPicture').src = albumArt;
                } else {
                    document.getElementById('songPicture').src = './assets/svg/no_image.svg';
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
            },
            onError: function (tag) {
                $('#songTitle').text(newFileName);
                $('#artist').text('Unknown Artist');
                document.getElementById('songPicture').src = './assets/svg/no_image.svg';
                if (!artist) {
                    $('title').text(`${newFileName}`);
                }

                console.log("hey, we got an ID3 tag error :(");
            }
        })
    audio.addEventListener('timeupdate', seekTimeUpdate);
}

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

function seekGetP(e) {
    seekP = (e.clientX - seekBar.offsetLeft) / seekBar.clientWidth;
    seekP = clamp(0, seekP, 1);
    return seekP;
}

function volGetP(e) {
    volP = (e.clientX - volBar.offsetLeft) / volBar.clientWidth;
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
            if (audio.volume == 0) {
                isMuted = true;
                $('#volumeButton').text('volume_off');
            } else {
                isMuted = false;
                $('#volumeButton').text('volume_up');
            }
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
        }
    }
});