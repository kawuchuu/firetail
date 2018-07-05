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
var currentNumber;
var currentTheme;

var os = require('os');
var fs = require('fs')

/*if (!fs.existsSync('./settings.json')) {
    theme = {
        theme: 'dark'
    }
    themeString = JSON.stringify(theme)
    fs.writeFile('./settings.json', themeString);
}*/

$(document).ready(function() {
    setTimeout(function() {
        $('#loadCover').css({
            opacity: 0
        })
        setTimeout(function() {
            $('#loadCover').hide();
        }, 250)
    }, 1000)
})

var fileExtentions = ['mp3', 'wav', 'm4a', 'ogg', '3gp', 'aac', 'flac', 'webm', 'raw'];
var newSongs = [];

try {
    $('#newList').html('<p style="text-align: center">Loading...');
    var theme;
    var themeString;

    remote = require('electron').remote;
    remote.getCurrentWindow().setMinimumSize(595, 525);

    function loadFiles() {
        setTimeout(function() {
            if (!fs.existsSync(`${os.homedir}/Music/Audiation`)) {
                fs.mkdirSync(`${os.homedir}/Music/Audiation`);
            }
            fs.readdir(`${os.homedir}/Music/Audiation`, (err, files) => {
                if (err) console.error(err);
                newSongs = files.filter(f => f.split(".").pop() === 'mp3' || 'm4a' || 'wav' || 'ogg' || '3gp' || 'aac' || 'flac' || 'webm' || 'raw');

                if (newSongs.length === 0) {
                    $('#newList').html('<p style="text-align: center">No valid audio files found in the Audiation folder.<br><a class="open-file-browser">Click here</a> to open the Audiation folder.')
                    return $('.open-file-browser').click(function() {
                        require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
                    });
                }
                fileTotal = newSongs.length - 1;
                $('#newList').html('');
                newSongs.forEach((f, i) => {
                    newFileName = f.slice(0, -4)
                    $('#newList').append(`<li class="results-link" id="newSong${i}"><i class="play-pause fas fa-play" style="display: none; opacity: 0; transition: .2s;"></i><p class="new-song-title">${newFileName}`);
                    if (currentlyPlaying === true && currentSongPlaying) {
                        $(currentSongPlaying).css({
                            color: '#c464f1'
                        })
                        $(`${currentSongPlaying} p`).addClass('new-song-constant');
                        $(`${currentSongPlaying} i`).show();
                        $(`${currentSongPlaying} i`).addClass('new-song-icon-constant')
                        $(`${currentSongPlaying} i`).css({
                            opacity: 1
                        })
                        if (pauseButtonActive === false) {
                            $(`${currentSongPlaying} i`).removeClass('fa-play');
                            $(`${currentSongPlaying} i`).addClass('fa-pause');
                        } else {
                            $(`${currentSongPlaying} i`).addClass('fa-play');
                            $(`${currentSongPlaying} i`).removeClass('fa-pause');
                        }
                    }
                    $(`#newSong${i}`).click(function() {
                        if (currentlyPlaying === true && $(this).attr('id') === currentSongPlaying.substr(1)) {
                            resumeButton();
                        } else {
                            currentSongPlaying = `#newSong${i}`;
                            currentNumber = i;
                            $('.play-pause').removeClass('fa-pause');
                            $('.play-pause').addClass('fa-play');
                            $(`p.new-song-title`).removeClass('new-song-constant');
                            $(`.play-pause`).removeClass('new-song-icon-constant')
                            $(`.play-pause`).css({
                                opacity: 0
                            })
                            $('.results-link').css({color: '#fff'})
                            $(`#newSong${i} i`).hide();
                            newFileName = f.slice(0, -4)
                            newFileChosen = f;
                            if (currentlyPlaying === true) {
                                audioStop();
                            }
                            $('p#songDuration').text('Calculating...')
                            classicDetectSong();
                            $(this).css({
                                color: '#c464f1'
                            })
                            $(`#newSong${i} p`).addClass('new-song-constant');
                            $(`#newSong${i} i`).show();
                            $(`#newSong${i} i`).addClass('new-song-icon-constant')
                            $(`#newSong${i} i`).css({
                                opacity: 1
                            })
                            $(`#newSong${i} i`).removeClass('fa-play');
                            $(`#newSong${i} i`).addClass('fa-pause');
                        }
                    });
                    $(`#newSong${i}`).mouseover(function() {
                        $(`#newSong${i} p`).addClass('new-song-hover');
                        $(`#newSong${i} i`).show();
                        $(`#newSong${i} i`).css({
                            opacity: 1
                        })
                    })
                    $(`#newSong${i}`).mouseleave(function() {
                        $(`#newSong${i} p`).removeClass('new-song-hover')
                        $(`#newSong${i} i`).css({
                            opacity: 0
                        });
                        $(`#newSong${i} i`).hide();
                    })
                })
            })
        }, 500)
    }
    loadFiles();
    $('#openFileBrowser').click(function() {
        require('child_process').exec(`start "" "${os.homedir}\\Music\\Audiation`)
    });

    $('#refreshFiles').click(function() {
        $('#newList').html('<p style="text-align: center">Loading...');
        loadFiles();
    })

    $('#backwardButton').click(function() {
        alert('what you actually think this works like seriously it doesn\'t so move along please')
        if (currentlyPlaying === true && $(this).attr('id') === currentSongPlaying.substr(1)) {
            resumeButton();
        } else {
            currentSongPlaying = `#newSong${currentSongPlaying.substr(8,9) - 1}`;
            $('.play-pause').removeClass('fa-pause');
            $('.play-pause').addClass('fa-play');
            $(`p.new-song-title`).removeClass('new-song-constant');
            $(`.play-pause`).removeClass('new-song-icon-constant')
            $(`.play-pause`).css({
                opacity: 0
            })
            $('.results-link').css({color: '#fff'})
            $(`#newSong${i} i`).hide();
            newFileName = f.slice(0, -4)
            newFileChosen = f;
            if (currentlyPlaying === true) {
                audioStop();
            }
            $('p#songDuration').text('Calculating...')
            classicDetectSong();
            $(this).css({
                color: '#c464f1'
            })
            $(`#newSong${i} p`).addClass('new-song-constant');
            $(`#newSong${i} i`).show();
            $(`#newSong${i} i`).addClass('new-song-icon-constant')
            $(`#newSong${i} i`).css({
                opacity: 1
            })
            $(`#newSong${i} i`).removeClass('fa-play');
            $(`#newSong${i} i`).addClass('fa-pause');
        }
    })

    $('#forwardButton').click(function() {
        alert('what you actually think this works like seriously it doesn\'t so move along please')
    })

    /*const mainSettings = require('./settings.json');
    currentTheme = 'dark'

    function switchThemes() {
        switch(currentTheme) {
            case "dark":
                $('body, h1, #headerIcon, li, div.title-bar, div.tb-button svg').addClass('light-theme');
                currentTheme = 'light'
                break;
            case "light":
                $('body, h1, #headerIcon, li, div.title-bar, div.tb-button svg').removeClass('light-theme');
                currentTheme = 'dark'
        }
    }

    if (mainSettings.theme === "light") {
        $('body').addClass('light-theme')
    }

    $('#switchThemesSpacer, #switchThemesButton').css({
        display: 'inline-block'
    })

    $('#switchThemesButton').click(function() {
        switchThemes();
    })*/

    $('.tb-close').click(function() {
        const remote = require('electron').remote;
        var window = remote.getCurrentWindow();
        window.close();
    });

    $('.tb-maximize').click(function() {
        const remote = require('electron').remote;
        var window = remote.getCurrentWindow();
        if (!window.isMaximized()) {
            window.maximize();          
        } else {
            window.unmaximize();
        }
    });

    $('.tb-minimize').click(function() {
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
} catch(err) {
    console.error(`${err}\nThis usually means Audiation's HTML page was opened in a web browser.`);
}

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

$('#settingsButton').click(function() {
    $('#settings').show();
})

$("#settingsClose").click(function() {
    $("#settings").hide();
})

var fileAudio;

document.getElementById('fileChoose').onchange = function(e) {
    var extention = this.files[0].name.split('.').pop().toLowerCase(),
        success = fileExtentions.indexOf(extention) > -1;
    if (success) {
        var reader = new FileReader();
        reader.onload = function(e) {
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
}
var songTitleName;

function audioStop() {
    $('.play-pause').removeClass('fa-pause');
    $('.play-pause').addClass('fa-play');
    $('.new-nowplaying').removeClass('np-active');
    $(`p.new-song-title`).removeClass('new-song-constant');
    $(`.play-pause`).removeClass('new-song-icon-constant')
    pauseButtonActive = false;
    //audio.play();
    $(`#pauseButton`).removeClass('fa-play');
    $(`#pauseButton`).addClass('fa-pause');
    //$('#pauseButton').text('Pause')
    $(`.play-pause`).css({
         opacity: 0
    })
    $('.results-link').css({color: '#fff'})
    $(`.play-pause`).hide();
    audio.pause();
    audio.currentTime = 0;
    currentlyPlaying = false;
    noSongPlaying();
    $('div.playing-now').removeClass('playing-now-active');
    $('div.play-button, select, div.play-type').show();
    if (audioChoiceType === "localFile") {
        $('div#localFilePlay').show();
    }
    pauseButtonActive = false;
}

var ytaudiotype;

var biquadFilter;
var audioCtx;
var artist;
var newSongTitle;

function classicDetectSong() {
    try {
        if (audioChoiceType === "localFile" && fileName) {
            songTitleName = fileName.split(".").pop() === 'mp3';
        } else if (audioChoiceType === "new") {
            songTitleName = newFileName;
        } else {
            songTitleName = fileName;
        }
        if (songTitleName.includes(' - ')) {
            var newSongTitleName = songTitleName.split(' - ');
            artist = newSongTitleName[0];
            newSongTitle = newSongTitleName[1];
        } else {
            newSongTitle = songTitleName;
            artist = 'Unknown'
        }
        if (audio) {
            audio.removeEventListener('timeupdate', seekTimeUpdate);
        }
        $('.new-nowplaying').addClass('np-active');
        currentlyPlaying = true;
        noSongPlaying();
        if (audioChoiceType === 'localFile') {
            audio = new Audio(fileAudio);
            audio.currentTime = 0;
            audio.play();
            //$('h1#songTitle').text(fileName)
        }
        if (audioChoiceType === 'new') {
            try {
                audio = new Audio(`${os.homedir}/Music/Audiation/${newFileChosen}`);
                audio.currentTime = 0;
                audio.play().catch(function(err) {
                    console.error(err);
                    alert('Unable to play this song.');
                    $('#songTitle').text('No Song Playing...')
                    $('#artist').text('Unknown')
                    $('p#songDuration').text('0:00 / 0:00')
                    audioStop();
                })
            } catch(err) {
                console.error(err);
                alert('Unable to play this song.');
                $('#songTitle').text('No Song Playing...')
                $('#artist').text('Unknown')
                $('p#songDuration').text('0:00 / 0:00')
                audioStop();
            }
        }
        $('h1#songTitle').text(newSongTitle);
        $('#artist').text(artist)
        seekBarTrack();
        audio.volume = 1;
    } catch(err) {
        console.error(err.stack)
        currentlyPlaying = false;
        audioStop();
    }
}

$('button#localPlay').click(function() {
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

$('#openDevTools').click(function() {
    var remote = require('electron').remote;
    remote.getCurrentWindow().openDevTools();
})

$('button#newPlay').click(function() {
    $('div#localFilePlay').hide();
    $('div#new').show();
    audioChoiceType = 'new';
    $('#playButton').hide();
    $('#refreshFiles').show();
    $('#openFileBrowser').show();
    $(this).addClass('button-active');
    $('button#localPlay').removeClass('button-active');
})

$('#playButton').click(function() {
    $('p#songDuration').text('Calculating...')
    if (currentlyPlaying === true) {
        audioStop();
    }
    if (audioChoiceType === "new" || audioChoiceType === "localFile" && hasChoseFile === true) {
        classicDetectSong();
    }
})

$('#stopButton').click(function() {
    if (currentlyPlaying === true) {
        audioStop();
    }
})

var pauseButtonActive = false;

$('#pauseButton').click(function() {
    resumeButton()
})

function resumeButton() {
    switch(pauseButtonActive) {
        case false:
            pauseButtonActive = true;
            audio.pause();
            $(`#pauseButton, ${currentSongPlaying} i`).removeClass('fa-pause');
            $(`#pauseButton, ${currentSongPlaying} i`).addClass('fa-play');
            //$('#pauseButton').text('Resume');
            break;
        case true:
            pauseButtonActive = false;
            audio.play();
            $(`#pauseButton, ${currentSongPlaying} i`).removeClass('fa-play');
            $(`#pauseButton, ${currentSongPlaying} i`).addClass('fa-pause');
            //$('#pauseButton').text('Pause')
    }
}

$('div.seek-bar').mouseover(function() {
    if (currentlyPlaying === true) {
        $('div.handle').addClass('handle-hover');
    }
})

$('div.seek-bar').mouseleave(function() {
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
        audioStop();
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
    $('#songDuration').html(`${minutes}:${seconds} / ${durationMinutes}:${durationSeconds}`);
}

var seekBar = document.querySelector('.seek-bar');
var fillBar = seekBar.querySelector('.fill');
var audioLength = document.querySelector('#songDuration');
        
function seekBarTrack() {
    $('p#songDuration').text('Calculating...')
    audio.addEventListener('timeupdate', seekTimeUpdate);
    audio.addEventListener('waiting', function() {
        $('p#songDuration').text('Buffering...')
    })
}

var mouseDown = false;

function clamp (min, val, max) {
    return Math.min(Math.max(min, val), max);
}

var p;

function getP (e) {
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
        $('#songDuration').html(`${minutes}:${seconds} / ${durationMinutes}:${durationSeconds}`);
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