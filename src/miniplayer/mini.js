var ipc = require('electron').ipcRenderer;
var remote = require('electron').remote;
var settings = require('electron-settings')
var tagInfo;
var seekTimeInfo;
var seekBar = document.querySelector('.seek-bar');
var seekBarWrapper = document.querySelector('#seekWrapper');
var seekFillBar = seekBar.querySelector('#seekFill');
var seekMouseDown = false;
var currentlyPlaying = false;
var shuffleEnabled = false;
var repeatEnabled = false;
var paused = false;
var theme = 'dark';

if (settings.get('theme') == 'light') {
    theme = 'light';
    $('html').addClass('light');
    document.getElementById('art').src = '/assets/no_image_light.svg'
}

function resumeButton() {
    switch(paused) {
        case true:
            paused = false;
            $('#miniResume').text('pause')
        break;
        case false:
            paused = true;
            $('#miniResume').text('play_arrow')
    }
}

var blurEnabled = true;

function blurBg(i) {
    if (i == false) {
        $('.blur-bg').hide();
        $('.meta-text, .extra-buttons, html').removeClass('bg');
    } else {
        $('.blur-bg').show();
        $('.meta-text, .extra-buttons, html').addClass('bg');
    }
    blurEnabled = settings.get('mini-player-bg');
}

ipc.on('setting-change', (event, arg) => {
    console.log(arg[0]);
    switch(arg[0]) {
        case "theme":
            theme = arg[1];
            $('html').attr('class', `${arg[1]} ${settings.get('colour-accent')}`);
            bgImage = $('.album-art').attr('src');
            if (theme == 'light' && bgImage.includes('no_image')) {
                $('.album-art').attr('src', '/no_image_light.svg');
            } else if (bgImage.includes('no_image')) {
                $('.album-art').attr('src', '/assets/no_image.svg');
            }
            break;
        case "mini-bg":
            blurBg(arg[1])
            break;
        case "colour-accent":
            $('html').attr('class', `${theme} ${arg[1]}`);
            break;
        case "icon-style":
            console.log('run');
            switch(arg[1]) {
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
            break;
    }
})

$('#miniResume').click(() => {
    ipc.send('playpause');
})

$('#miniPrevious').click(() => {
    ipc.send('previous')
})

$('#miniNext').click(() => {
    ipc.send('next')
})

function enableShuffle() {
    switch(shuffleEnabled) {
        case true:
            shuffleEnabled = false;
            $('#miniShuffle').css({
                color: 'var(--text)',
                'text-shadow': 'none'
            });
            break;
        case false:
            shuffleEnabled = true;
            $('#miniShuffle').css({
                color: 'var(--hl-txt)',
                'text-shadow': '0px 2px 15px var(--glow)'
            });
    }
}

function enableRepeat() {
    switch(repeatEnabled) {
        case true:
            repeatEnabled = false;
            $('#miniRepeat').css({
                color: 'var(--text)',
                'text-shadow': 'none'
            });
        break;
        case false:
            repeatEnabled = true;
            $('#miniRepeat').css({
                color: 'var(--hl-txt)',
                'text-shadow': '0px 2px 15px var(--glow)'
            });
    }
}

$('#miniShuffle').click(() => {
    ipc.send('shuffle')
})

$('#miniRepeat').click(() => {
    ipc.send('repeat');
})

ipc.on('shuffle-enable', () => {
    enableShuffle();
})

ipc.on('repeat-enable', () => {
    enableRepeat()
})

ipc.on('play-pause-mini', () => {
    resumeButton();
})

ipc.on('play-mini', () => {
    paused = false
    $('#miniResume').text('pause')
})

ipc.on('tag-info', (event, arg) => {
    tagInfo = arg;
    currentlyPlaying = true;
    $('#miniResume').text('pause')
    $('.song-title').text(tagInfo.title);
    $('.song-artist').text(tagInfo.artist);
    var noImage = false;
    if (tagInfo.art == "../../assets/no_image.svg") {
        tagInfo.art = "../../assets/no_image.svg";
        noImage = true;
    } else if (tagInfo.art == "../../assets/no_image_light.svg") {
        tagInfo.art = "../../assets/no_image_light.svg";
        noImage = true;
    };
    document.getElementById('art').src = tagInfo.art;
    if (noImage == false) {
        $('.album-bg').css('background-image', `url(${tagInfo.art})`)
        if (blurEnabled == true) {
            blurBg(true);
        } else {
            blurBg(false)
        }
    } else {
        $('.album-bg').css('background-image', '')
        blurBg(false);
    }
    paused = false;
})

ipc.on('switch-windows', () => {
    remote.getCurrentWindow().show();
})

$('#closeMini').click(() => {
    remote.getCurrentWindow().hide();
    ipc.send('switch-windows-full');
});

ipc.on('shortcut-close', () => {
    remote.getCurrentWindow().hide();
    ipc.send('switch-windows-full');
})

$('#minimizeMini').click(() => {
    remote.getCurrentWindow().minimize();
})

ipc.on('seek-time', (event, arg) => {
    seekTimeInfo = arg;
    var p = seekTimeInfo.currentTimeValue / seekTimeInfo.songDurationValue;
    seekFillBar.style.width = p * 100 + '%';
    document.getElementById('songDurationTime').innerHTML = seekTimeInfo.currentTimeString;
    document.getElementById('songDurationLength').innerHTML = seekTimeInfo.songDurationString;
})

ipc.on('is-playing', (event, arg) => {
    currentlyPlaying = arg;
})

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

function clamp(min, val, max) {
    return Math.min(Math.max(min, val), max);
}

function seekGetP(e) {
    seekP = (e.clientX - seekBar.getBoundingClientRect().x) / seekBar.clientWidth;
    seekP = clamp(0, seekP, 1);
    return seekP;
}

seekBarWrapper.addEventListener('mousedown', function (e) {
    if (currentlyPlaying === true) {
        seekMouseDown = true;
        seekP = seekGetP(e);
        seekFillBar.style.width = seekP * 100 + '%';
        ipc.send('remove-audio-listener');
        $('#seekHandle').addClass('handle-hover');
    }
});

window.addEventListener('mousemove', function (e) {
    if (seekMouseDown == false) return;
    if (currentlyPlaying === true) {
        if (seekMouseDown == true) {
            seekP = seekGetP(e);
            seekFillBar.style.width = seekP * 100 + '%';
            minutes = Math.floor((seekP * seekTimeInfo.songDurationValue) / 60);
            seconds = Math.floor((seekP * seekTimeInfo.songDurationValue) / 1);
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
    if (seekMouseDown == false) return;
    if (currentlyPlaying === true) {
        if (seekMouseDown == true) {
            seekMouseDown = false;
            seekP = seekGetP(e);
            seekFillBar.style.width = seekP * 100 + '%';
            $('#seekHandle').removeClass('handle-hover');
            ipc.send('seek-time-main', seekP * seekTimeInfo.songDurationValue)
        }
    }
});

window.onbeforeunload = (i) => {
    remote.getCurrentWindow().hide();
    ipc.send('switch-windows-full');
    i.returnValue = false;
}