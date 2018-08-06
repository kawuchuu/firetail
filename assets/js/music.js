var audio;

var audioChoiceType = 'new';
var hasChoseFile = false;

var fileName;
var readFile;
var currentlyPlaying = false;
var fileTotal;
var newFileChosen;
var newFileName;
var pauseButtonActive = false;
var currentSongPlaying;
var currentTheme;
var allFilesList = [];
var repeatEnabled = false;
var artist;
var Title;
var tags;
var shuffleEnabled = false;
var shuffleOrder = [];
var fileSongListStore = [];

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
    })
}

var fileExtentions = ['mp3', 'wav', 'm4a', 'ogg', '3gp', 'aac', 'flac', 'webm', 'raw'];
var s = [];

$('#newList').html('<p style="text-align: center">Loading...');
var theme;
var themeString;

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
    $(`#${currentSongPlaying} i`).hide();
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
var tempArray = ['test', 'a', 'asda', 'dasdsadad']
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
    //alert('Warning: Shuffle is still pretty broken.')
    shuffleEnabled = true;
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

$('.tb-minimize').click(function () {
    const remote = require('electron').remote;
    var window = remote.getCurrentWindow();
    window.minimize();
})

document.addEventListener("keydown", function (e) {
    if (e.which === 123) {
        require('remote').getCurrentWindow().openDevTools();
    } else if (e.which === 116) {
        location.reload();
    }
});

function noSongPlaying() {
    if (currentlyPlaying === false) {
        $('#songTitle, div.seek-bar, #songDuration').addClass('not-playing');
        $('#stopButton, .resume-button, #pauseButton').addClass('button-active');
    } else {
        $('#songTitle, div.seek-bar, #songDuration').removeClass('not-playing');
        $('#stopButton, .resume-button, #pauseButton').removeClass('button-active');
    }
}

noSongPlaying();

$('#settingsButton').click(function () {
    $('#settings').show();
})

$("#settingsClose").click(function () {
    $("#settings").hide();
})

var fileAudio;

/*document.getElementById('fileChoose').onchange = function (e) {
    var extention = this.files[0].name.split('.').pop().toLowerCase(),
        success = fileExtentions.indexOf(extention) > -1;
    if (success) {
        var reader = new FileReader();
        reader.onload = function (e) {
            fileAudio = this.result;
        }
        reader.readAsDataURL(this.files[0]);
        fileName = this.files[0].name;
        $('p#fileChosenText').text(`FILE CHOSEN: ${fileName}`).css({
            display: 'block'
        })
        hasChoseFile = true;
        $('button#playButton').removeClass('button-active')
    } else {
        hasChoseFile = false;
        $('p#fileChosenText').text(`PLEASE CHOOSE A VALID FILE TYPE`);
        return $('button#playButton').addClass('button-active');
    }
}*/
var songTitleName;

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
        new id3.Reader(`${os.homedir}/Music/Audiation/${newFileChosen}`)
            .setTagsToRead(['title', 'artist', 'picture'])
            .read({
                onSuccess: function (tag) {
                    artist = tag.tags.artist;
                    Title = tag.tags.title;
                    newTags = tag;
                    if (!tag.tags.artist) {
                        artist = 'Unknown'
                    }
                    if (!tag.tags.title) {
                        Title = newFileName;
                    }
                    var base64String = '';
                    if (tag.tags.picture) {
                        for (var i = 0; i < tag.tags.picture.data.length; i++) {
                            base64String += String.fromCharCode(tag.tags.picture.data[i]);
                        }
                        document.getElementById('songPicture').src = 'data:' + tag.tags.picture.format + ';base64,' + window.btoa(base64String);
                    } else {
                        document.getElementById('songPicture').src = './assets/svg/no_image.svg';
                    }
                    $('h1#songTitle').text(Title);
                    $('#artist').text(artist)
                },
                onError: function () {
                    $('#songTitle').text(newFileName);
                    $('#artist').text('Unknown');
                    document.getElementById('songPicture').src = './assets/svg/no_image.svg';
                }
            })
        if (audio) {
            audio.removeEventListener('timeupdate', seekTimeUpdate);
        }
        $('.new-nowplaying').addClass('np-active');
        currentlyPlaying = true;
        noSongPlaying();
        if (audioChoiceType === 'new') {
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
        }
        seekBarTrack();
        audio.volume = 1;
    } catch (err) {
        console.error(err.stack)
        currentlyPlaying = false;
        audioStop();
    }
}

$('button#localPlay').click(function () {
    //$('div#localFilePlay').css({
    //display: 'block'
    //});
    $('div#new').css({
        display: 'none'
    })
    $('#playButton').show();
    audioChoiceType = 'localFile';
    $(this).addClass('button-active');
    $('button#newPlay').removeClass('button-active');
    if (hasChoseFile === false) {
        $('button#playButton').addClass('button-active')
    }
    $('#refreshFiles').hide();
    $('#openFileBrowser').hide();
})

$('#openDevTools').click(function () {
    var remote = require('electron').remote;
    remote.getCurrentWindow().toggleDevTools();
})

$('button#newPlay').click(function () {
    $('div#localFilePlay').hide();
    $('div#new').show();
    audioChoiceType = 'new';
    $('#playButton').hide();
    $('#refreshFiles').show();
    $('#openFileBrowser').show();
    $(this).addClass('button-active');
    $('button#localPlay').removeClass('button-active');
})

$('#playButton').click(function () {
    $('p#songDuration').text('Calculating...')
    if (currentlyPlaying === true) {
        audioStop();
    }
    if (audioChoiceType === "new" || audioChoiceType === "localFile" && hasChoseFile === true) {
        classicDetectSong();
    }
})

$('#stopButton').click(function () {
    if (currentlyPlaying === true) {
        audioStop();
    }
})

var pauseButtonActive = false;

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

var durationSongLength;
var durationSeconds;
var durationMinutes;

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

var seconds;
var minutes;

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

var seekBar = document.querySelector('.seek-bar');
var fillBar = seekBar.querySelector('.fill');
var audioLength = document.querySelector('#songDuration');

function seekBarTrack() {
    $('p#songDuration').text('Calculating...')
    audio.addEventListener('timeupdate', seekTimeUpdate);
    audio.addEventListener('waiting', function () {
        $('p#songDuration').text('Buffering...')
    })
}

var mouseDown = false;

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

var p;

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