var id3 = require('jsmediatags');
let fs = require('fs-extra');
var albumArt;

onmessage = function(e) {
    var base64String = '';
    var newFileChosen = e.data[0];
    let appPath = e.data[2].replace(/[\\[]/g, "/");;
    new id3.Reader(newFileChosen)
    .setTagsToRead(['album', 'picture'])
    .read({
        onSuccess: function (tag) {
            new Promise((resolve) => {
                if (tag.tags.picture) {
                    let mName = tag.tags.album.replace(/[.:<>"*?/{}()|[\]\\]/g, "_");
                    fs.access(`${appPath}/Cache/${mName}.jpg`, fs.constants.F_OK | fs.constants.W_OK, (err) => {
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
                                    resolve(true)
                                });
                            }
                        } else {
                            albumArt = mName;
                            resolve(true)
                        }
                    })
                } else {
                    albumArt = null;
                    resolve(true);
                }
            }).then(() => {
                postMessage(albumArt);
            });
        },
        onError: function (tag) {
            postMessage(null);
        }
    })
}