const fs = require('fs').promises;
const fsconst = require('fs').constants;

onmessage = async (message) => {
    let userData = message.data.userData;
    let check = new Promise(resolve => {
        fs.access(`${userData}/library.json`, fsconst.F_OK | fsconst.W_OK, (err) => {
            if (err) {
                console.error(err);
                return postMessage(false);
            } else {
                resolve();
            }
        });
    });
    await check;
    fs.readFile(`${userData}/library.json`, (err) => {
        if (err) {
            console.error(err);
            return postMessage(false);
        }
    }).then(async (file) => {
        file = JSON.parse(file.toString());
        let listStart = Object.entries(file).map(bruh => [bruh[0]]);
        let genList = new Promise((resolve) => {
            let songIndex = [];
            let numCount = 0;
            let artistList = [];
            let artistsUsed = [];
            let albumList = [];
            let albumsUsed = [];
            listStart.forEach((value) => {
                value = value[0];
                let fName = value.split('.');
                let fileName = value.slice(0, -fName[fName.length - 1].length - 1);
                if (process.platform == 'win32') {
                    fileName = fileName.substr(fileName.lastIndexOf('\\') + 1);
                } else {
                    fileName = fileName.substr(fileName.lastIndexOf('/') + 1);
                }
                let title = fileName;
                let artist = 'Unknown Artist';
                let album = 'Unknown Album';
                if (file[value].title) title = file[value].title;
                if (file[value].artist) artist = file[value].artist;
                if (file[value].album) album = file[value].album;
                songIndex.push({
                    'file': value,
                    'title': title,
                    'artist': artist,
                    'album': album,
                    'songId': file[value].id,
                    'id': numCount
                });
                if (artistsUsed.indexOf(artist) == -1) {
                    artistList.push({
                        'artist': artist
                    });
                    artistsUsed.push(artist);
                };
                if (albumsUsed.indexOf(album) == -1) {
                    albumList.push({
                        'album': album
                    });
                    albumsUsed.push(album);
                };
                numCount++;
            });
            resolve([songIndex, artistList, albumList]);
        });
        let list = await genList;
        postMessage(list);
    });
}