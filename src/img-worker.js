onmessage = function(e) {
    var albumArt;
    var base64String = '';
    var newFileChosen = e.data[0];
    var tmpFile;
    var dataUrl;
    var id3 = require('jsmediatags');
    let tmp = require('tmp');
    let fs = require('fs-extra');
    let tmpobj = e.data[1];
    new id3.Reader(newFileChosen)
    .setTagsToRead(['picture'])
    .read({
        onSuccess: function (tag) {
            new Promise((resolve) => {
                if (tag.tags.picture) {
                    for (var i = 0; i < tag.tags.picture.data.length; i++) {
                        base64String += String.fromCharCode(tag.tags.picture.data[i]);
                    }
                    dataUrl = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                    if (process.platform == 'linux') {
                        tmpFile = tmp.tmpNameSync({
                            template: 'tmp-XXXXXX'
                        });
                        fs.writeFile(`${tmpobj}/${tmpFile}.jpg`, btoa(base64String), 'base64', function (err) {
                            if (err) console.error(err);
                            albumArt = `${tmpobj}/${tmpFile}.jpg`;
                            resolve(true)
                        })
                    } else {
                        albumArt = dataUrl;
                        resolve(true)
                    }
                } else {
                    albumArt = null;
                    resolve(true);
                }
            }).then(() => {
                postMessage(albumArt);
                id3 = null;
            });
        },
        onError: function (tag) {
            postMessage(null);
            id3 = null;
        }
    })
}