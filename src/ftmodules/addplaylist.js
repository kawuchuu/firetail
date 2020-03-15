const fs = require('fs');

onmessage = async (e) => {
    let songsToAdd = e.data[0];
    let playlistToAdd = e.data[1];
    let appPath = e.data[2];
    fs.promises.readFile(`${appPath}/playlist.json`, (err) => {
        if (err) console.log(err);
    }).then(async file => {
        playlistFile = JSON.parse(file.toString());
        songsToAdd.forEach(f => {
            playlistFile[playlistToAdd].files.push(f);
        });
        let formattedMetadata = JSON.stringify(playlistFile);
        fs.writeFile(`${appPath}/playlist.json`, formattedMetadata, err => {
            if (err) console.error(err);
            postMessage(true);
        });
    });
}