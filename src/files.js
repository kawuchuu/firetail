onmessage = function(e) {
    let dragFiles = e.data[0];
    let songMetadata = e.data[1];
    let appPath = e.data[2];
    let songNum = [];
    var id3 = require('jsmediatags');
    let fs = require('fs-extra');
    let notValid = 0;
    new Promise((resolve) => {
        console.log(`Validating ${dragFiles.length} files...`)
        for (let i = 0; i < dragFiles.length; i++) {
            if (dragFiles[i].type.substr(0,5) != "audio") {
                notValid++;
            } else {
                songNum.push(dragFiles[i].path);
            }
        }
        resolve(true);
    }).then((a) => {
        if (notValid != 0) console.log(`Skipped ${notValid} files, non-audio files`)
        if (songNum.length == 0) return postMessage(0);
        new Promise((resolve) => {
            console.log(`Collecting metadata for ${songNum.length} songs...`);
            let postSongNum = 0;
            for (let i = 0; i < songNum.length; i++) {
                new Promise((resolve) => {
                    id3.read(songNum[i], {
                        onSuccess: function (tag) {
                            songData = {
                                'title': tag.tags.title,
                                'artist': tag.tags.artist,
                                'album': tag.tags.album
                            }
                            songMetadata[songNum[i]] = songData;
                            fs.writeJsonSync(`${appPath}/library.json`, songMetadata);
                            resolve(true);
                        },
                        onError: function (err) {
                            songMetadata[songNum[i]] = {};
                            fs.writeJsonSync(`${appPath}/library.json`, songMetadata);
                            resolve(true);
                        }
                    });
                }).then(() => {
                    postSongNum++;
                    if (postSongNum == songNum.length) {
                        postMessage(songNum.length);
                    }
                })
            }            
        })
    })
}