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
 * Original Repo: https://github.com/projsh/audiation
 */

var audio;
var currentlyPlaying = false;
var fileTotal;
var newFileChosen;
var newFileName;
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
var pauseButtonActive = false;
var fileAudio;
var songTitleName;
var durationSongLength;
var durationSeconds;
var durationMinutes;
var seconds;
var minutes;
var seekBar = document.querySelector('.seek-bar');
var fillBar = seekBar.querySelector('.fill');
var audioLength = document.querySelector('#songDuration');
var mouseDown = false;
var p;
var s = [];

var os = require('os');
var fs = require('fs');
var id3 = require('jsmediatags');

$(document).ready(function () {
    setTimeout(function () {
        $('#loadCover').css({
            opacity: 0
        })
        setTimeout(function () {
            $('#loadCover').hide();
        }, 250)
    }, 1000)
})

if (process.platform === 'win32') {
    $('.title-bar-wrapper').show();
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
}

$('#newList').html('<p style="text-align: center">Loading...');

remote = require('electron').remote;
remote.getCurrentWindow().setMinimumSize(720, 525);
document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())
document.querySelector('img').draggable = false;

function songActive() {
    $(`#${currentSongPlaying}`).css({
        color: '#c464f1'
    })
    $(`#${currentSongPlaying} p`).addClass('new-song-constant');
    $(`#${currentSongPlaying} i`).show();
    $(`#${currentSongPlaying} i`).addClass('new-song-icon-constant')
    $(`#${currentSongPlaying} i`).css({
        opacity: 1
    })
    if (pauseButtonActive === false) {
        $(`#${currentSongPlaying} i`).text('pause');
    } else {
        $(`#${currentSongPlaying} i`).text('play_arrow');
    }
}

function songActiveReset() {
    $('.play-pause').text('play_arrow');
    $(`p.new-song-title`).removeClass('new-song-constant');
    $(`.play-pause`).removeClass('new-song-icon-constant');
    $(`.play-pause`).css({
        opacity: 0
    })
    $('.results-link').css({
        color: '#fff'
    })
    $(`#${currentSongPlaying} i`).css({
        display: 'none'
    });
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

function loadFiles() {
    if (!fs.existsSync(`${os.homedir}/Music/Audiation`)) {
        fs.mkdirSync(`${os.homedir}/Music/Audiation`);
    }
    fs.readdir(`${os.homedir}/Music/Audiation`, (err, files) => {
        if (err) console.error(err);
        s = files.filter(f => f.split(".").pop() === 'mp3' || 'm4a' || 'wav' || 'ogg' || '3gp' || 'aac' || 'flac' || 'webm' || 'raw');

        if (s.length === 0) {
            $('#newList').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br><a class="open-file-browser">Click here</a> to open the Audiation folder.')
            return $('.open-file-browser').click(function () {
                require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
            });
        }

        fileTotal = s.length - 1;
        $('#newList').html('');
        s.forEach((f, i) => {
            fileSongListStore.push(f);
            allFilesList.push(f);
            newFileName = f.slice(0, -4)
            $('#newList').append(`<li class="results-link" id="${i}"><i class="material-icons play-pause" style="display: none; opacity: 0; transition: .2s;">play_arrow</i><p class="new-song-title">${newFileName}`);
            if (currentlyPlaying === true && currentSongPlaying) {
                songActive();
            }
            $(`#${i}`).click(function () {
                if (currentlyPlaying === true && $(this).attr('id') === `#${currentSongPlaying}`.substr(1)) {
                    resumeButton();
                } else {
                    currentSongPlaying = i;
                    songActiveReset();
                    newFileChosen = f;
                    newFileName = f.slice(0, -4)
                    if (currentlyPlaying === true) {
                        audioStop();
                    }
                    $('p#songDuration').text('Calculating...')
                    classicDetectSong();
                    $(`#pauseButton, #${currentSongPlaying} i`).text('pause');
                    songActive();
                }
            });
            $(`#${i}`).mouseover(function () {
                $(`#${i} p`).addClass('new-song-hover');
                $(`#${i} i`).css({
                    opacity: 1,
                    display: 'inline-block'
                })
            })
            $(`#${i}`).mouseleave(function () {
                $(`#${i} p`).removeClass('new-song-hover')
                $(`#${i} i`).css({
                    opacity: 0
                });
                $(`#${i} i`).hide();
            })
        })
        shuffleOrder = shuffle(allFilesList);
        allFilesList = fileSongListStore;
    })
}
loadFiles();
$('#openFileBrowser').click(function () {
    require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
});

$('#refreshFiles').click(function () {
    $('#newList').html('<p style="text-align: center">Loading...');
    loadFiles();
})

function previousSong() {
    audioStop();
    songActiveReset();
    if (shuffleEnabled === true) {
        allFilesList = shuffleOrder;
    } else {
        allFilesList = fileSongListStore;
    }
    currentSongPlaying = currentSongPlaying - 1;
    newFileChosen = allFilesList[currentSongPlaying];
    newFileName = newFileChosen.slice(0, -4);
    $(`#pauseButton, #${currentSongPlaying} i`).text('pause');
    songActive();
    classicDetectSong();
}

function nextSong() {
    audioStop();
    songActiveReset();
    if (shuffleEnabled === true) {
        allFilesList = shuffleOrder;
    } else {
        allFilesList = fileSongListStore;
    }
    currentSongPlaying = currentSongPlaying + 1;
    newFileChosen = allFilesList[currentSongPlaying];
    newFileName = newFileChosen.slice(0, -4);
    $(`#pauseButton, #${currentSongPlaying} i`).text('pause');
    songActive();
    classicDetectSong();
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
            break;
    }
});

$('#shuffleButton').click(function () {
    switch (shuffleEnabled) {
        case true:
            shuffleEnabled = false;
            $(this).css({
                color: '#fff'
            });
            break;
        case false:
            shuffleEnabled = true;
            $(this).css({
                color: '#c464f1'
            });
    }
})

/*$('.np-buttons i').mousedown(function() {
    $(this).css({
        color: '#7f00b9'
    })
})*/

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
            location.reload();
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
    currentlyPlaying = false;
    noSongPlaying();
    $('div.playing-now').removeClass('playing-now-active');
    $('div.play-button, select, div.play-type').show();
    pauseButtonActive = false;
}

function classicDetectSong() {
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
            audio.play().catch(function (err) {
                console.error(err);
                alert('Unable to play this song.');
                $('#songTitle').text('No Song Playing...')
                $('#artist').text('Unknown')
                $('p#songDuration').text('0:00 / 0:00')
                audioStop();
            })
        } catch (err) {
            console.error(err);
            alert('Unable to play this song.');
            $('#songTitle').text('No Song Playing...')
            $('#artist').text('Unknown')
            $('p#songDuration').text('0:00 / 0:00')
            audioStop();
        }
        seekBarTrack();
        audio.volume = 1;
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

function resumeButton() {
    switch (pauseButtonActive) {
        case false:
            pauseButtonActive = true;
            audio.pause();
            $(`#pauseButton, #${currentSongPlaying} i`).text('play_arrow');
            //$('#pauseButton').text('Resume');
            break;
        case true:
            pauseButtonActive = false;
            audio.play();
            $(`#pauseButton, #${currentSongPlaying} i`).text('pause');
    }
}

$('div.seek-bar').mouseover(function () {
    if (currentlyPlaying === true) {
        $('div.handle').addClass('handle-hover');
    }
})

$('div.seek-bar').mouseleave(function () {
    if (currentlyPlaying === true) {
        if (!mouseDown === false) return;
        $('div.handle').removeClass('handle-hover');
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
    fillBar.style.width = p * 100 + '%';
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
}

function seekBarTrack() {
    $('p#songDuration').text('Calculating...')
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
                    document.getElementById('songPicture').src = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                } else {
                    document.getElementById('songPicture').src = './assets/svg/no_image.svg';
                }
                $('h1#songTitle').text(Title);
                $('#artist').text(`${album}  \u2022  ${artist}`)
            },
            onError: function () {
                $('#songTitle').text(newFileName);
                $('#artist').text('Unknown Album \u2022 Unknown Artist');
                document.getElementById('songPicture').src = './assets/svg/no_image.svg';
            }
        })
    audio.addEventListener('timeupdate', seekTimeUpdate);
    audio.addEventListener('waiting', function () {
        $('p#songDuration').text('Buffering...')
    })
}

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

function getP(e) {
    p = (e.clientX - seekBar.offsetLeft) / seekBar.clientWidth;
    p = clamp(0, p, 1);
    return p;
}

seekBar.addEventListener('mousedown', function (e) {
    if (currentlyPlaying === true) {
        mouseDown = true;
        p = getP(e);
        fillBar.style.width = p * 100 + '%';
        audio.removeEventListener('timeupdate', seekTimeUpdate);
        $('div.handle').addClass('handle-hover');
    }
});

window.addEventListener('mousemove', function (e) {
    if (currentlyPlaying === true) {
        if (!mouseDown) return;
        p = getP(e);
        fillBar.style.width = p * 100 + '%';
        minutes = Math.floor((p * audio.duration) / 60);
        seconds = Math.floor((p * audio.duration) / 1);
        while (seconds >= 60) {
            seconds = seconds - 60;
        }
        if (seconds > -1 && seconds < 10) {
            seconds = ('0' + seconds).slice(-2);
        }
        $('#songDurationTime').html(`${minutes}:${seconds}`);
    }
});

window.addEventListener('mouseup', function (e) {
    if (currentlyPlaying === true) {
        if (!mouseDown) return;
        mouseDown = false;
        p = getP(e);
        fillBar.style.width = p * 100 + '%';
        audio.currentTime = p * audio.duration;
        $('div.handle').removeClass('handle-hover');
        seekBarTrack();
    }
});