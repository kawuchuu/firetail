onmessage = function(e) {
    var albumArt;
    var base64String = '';
    var newFileChosen = e.data;
    var tmpFile;
    var dataUrl;
    var id3 = require('jsmediatags');
    new id3.Reader(newFileChosen)
    .setTagsToRead(['picture'])
    .read({
        onSuccess: function (tag) {
            if (tag.tags.picture) {
                for (var i = 0; i < tag.tags.picture.data.length; i++) {
                    base64String += String.fromCharCode(tag.tags.picture.data[i]);
                }
                dataUrl = 'data:' + tag.tags.picture.format + ';base64,' + btoa(base64String);
                if (process.platform == 'linux') {
                    tmpFile = tmp.tmpNameSync({
                        template: 'tmp-XXXXXX'
                    });
                    fs.writeFile(`${tmpobj.name}/${tmpFile}.jpg`, btoa(base64String), 'base64', function (err) {
                        if (err) console.error(err);
                        albumArt = `${tmpobj.name}/${tmpFile}.jpg`;
                    })
                } else {
                    albumArt = dataUrl;
                }
            } else {
                albumArt = null;
            }
            postMessage(albumArt);
            id3 = null;
        },
        onError: function (tag) {
            postMessage(null);
            id3 = null;
        }
    })
}