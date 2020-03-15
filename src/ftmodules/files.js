const id3 = require('jsmediatags');
const fs = require('fs');
const fsconst = require('fs').constants;

onmessage = async function(e) {
    let dragFiles = e.data[0];
    let appPath = e.data[1];
    let songNum = [];
    let notValid = 0;
    let songMetadata;
    let check = new Promise(resolve => {
        fs.access(`${appPath}/library.json`, fsconst.F_OK | fsconst.W_OK, (err) => {
            if (err) {
                fs.appendFile(`${appPath}/library.json`, '{}', (err) => {
                    if (err) console.error(err);
                    resolve();
                })
            } else {
                resolve();
            }
        });
    })
    await check;
    fs.promises.readFile(`${appPath}/library.json`, (err) => {
        if (err) console.log(err);
    }).then(async file => {
        songMetadata = JSON.parse(file.toString());
        let validate = new Promise((resolve) => {
            for (let i = 0; i < dragFiles.length; i++) {
                if (dragFiles[i].type.substr(0,5) != "audio") {
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
        new Promise((resolve) => {
            let postSongNum = 0;
            for (let i = 0; i < songNum.length; i++) {
                new Promise((resolve) => {
                    id3.read(songNum[i], {
                        onSuccess: function (tag) {
                            songData = {
                                'title': tag.tags.title,
                                'artist': tag.tags.artist,
                                'album': tag.tags.album,
                                'id': i
                            }
                            songMetadata[songNum[i]] = songData;
                            if (tag.tags.picture && tag.tags.album) {
                                let mName = tag.tags.album.replace(/[.:<>"*?/{}()|[\]\\]/g, "_");
                                let base64String = '';
                                fs.promises.access(`${appPath}/Cache/${mName}.jpg`, fsconst.F_OK | fsconst.W_OK, (err) => {
                                    if (err) {
                                        if (err.code == 'ENOENT') {
                                            for (i = 0; i < tag.tags.picture.data.length; i++) {
                                                base64String += String.fromCharCode(tag.tags.picture.data[i]);
                                            }
                                            dataUrl = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                                            fs.writeFile(`${appPath}/Cache/${mName}.jpg`, btoa(base64String), 'base64', function (err) {
                                                if (err) console.error(err);
                                                albumArt = mName;
                                                resolve(true)
                                            });
                                        }
                                    } else {
                                        albumArt = mName;
                                        resolve(true)
                                    }
                                })
                            }
                            resolve(true);
                        },
                        onError: function () {
                            songMetadata[songNum[i]] = {'id': i};
                            resolve(true);
                        }
                    });
                }).then(() => {
                    postSongNum++;
                    postMessage([postSongNum, false]);
                    if (postSongNum == songNum.length) {
                        let formattedMetadata = JSON.stringify(songMetadata);
                        fs.writeFile(`${appPath}/library.json`, formattedMetadata, err => {
                            if (err) console.error(err);
                        });
                        postMessage([songNum.length, true]);
                    }
                })
            }
        })    
    })
}