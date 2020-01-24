const id3 = require('jsmediatags');
const fs = require('fs').promises;
const fsconst = require('fs').constants;

onmessage = async function (e) {
    let dragFiles = e.data[0];
    let appPath = e.data[1];
    let songNum = [];
    let notValid = 0;
    let songMetadata;
    fs.readFile(`${appPath}/library.json`, (err) => {
        if (err) console.error(err);
    }).then(async file => {
        songMetadata = JSON.parse(file.toString());
        let validate = new Promise((resolve) => {
            console.log(`Validating ${dragFiles.length} files...`)
            for (let i = 0; i < dragFiles.length; i++) {
                if (dragFiles[i].type.substr(0, 5) != "audio") {
                    notValid++;
                } else {
                    songNum.push(dragFiles[i].path);
                }
            }
            resolve(true);
        })
        await validate;
        if (notValid != 0) console.log(`Skipped ${notValid} files, non-audio files`)
        if (songNum.length == 0) return postMessage(0);
        console.log(`Collecting metadata for ${songNum.length} songs...`);
        let postSongNum = 0;
        let songIndex = [];
        songNum.forEach((f, i) => {
            id3.read(songNum[i], {
                onSuccess: function (tag) {
                    songData = {
                        'title': tag.tags.title,
                        'artist': tag.tags.artist,
                        'album': tag.tags.album
                    }
                    songMetadata[songNum[i]] = songData;
                    if (tag.tags.picture && tag.tags.album) {
                        let mName = tag.tags.album.replace(/[.:<>"*?/{}()|[\]\\]/g, "_");
                        let base64String = '';
                        fs.access(`${appPath}/Cache/${mName}.jpg`, fsconst.F_OK | fsconst.W_OK, (err) => {
                            if (err) {
                                if (err.code == 'ENOENT') {
                                    for (var i = 0; i < tag.tags.picture.data.length; i++) {
                                        base64String += String.fromCharCode(tag.tags.picture.data[i]);
                                    }
                                    dataUrl = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                                    fs.writeFile(`${appPath}/Cache/${mName}.jpg`, btoa(base64String), 'base64', function (err) {
                                        console.log('create')
                                        if (err) console.error(err);
                                        albumArt = mName;
                                    });
                                    console.log(`${postSongNum} || ${songNum.length}`)
                                    postSongNum++;

                                    if (postSongNum == songNum.length) {
                                        let formattedMetadata = JSON.stringify(songMetadata);
                                        fs.writeFile(`${appPath}/library.json`, formattedMetadata, err => {
                                            if (err) console.error(err);
                                        });
                                        postMessage(songNum.length);
                                    }
                                }
                            } else {
                                albumArt = mName;
                                console.log(`${postSongNum} || ${songNum.length}`)
                                postSongNum++;

                                if (postSongNum == songNum.length) {
                                    let formattedMetadata = JSON.stringify(songMetadata);
                                    fs.writeFile(`${appPath}/library.json`, formattedMetadata, err => {
                                        if (err) console.error(err);
                                    });
                                    postMessage(songNum.length);
                                }
                            }
                        })
                    }
                },
                onError: function (err) {
                    songMetadata[songNum[i]] = {};
                    postSongNum++;
                    console.log(`${postSongNum} || ${songNum.length}`)
                    if (postSongNum == songNum.length) {
                        let formattedMetadata = JSON.stringify(songMetadata);
                        fs.writeFile(`${appPath}/library.json`, formattedMetadata, err => {
                            if (err) console.error(err);
                        });
                        postMessage(songNum.length);
                    }
                }
            });
        })
    })
}