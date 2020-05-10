const fs = require('fs');
const fsconst = require('fs').constants;

onmessage = async (plName) => {
    console.log(plName)
    let appPath = plName.data[1];
    plName = plName.data[0];
    let check = new Promise(resolve => {
        fs.access(`${appPath}/playlist.json`, fsconst.F_OK | fsconst.W_OK, (err) => {
            if (err) {
                fs.appendFile(`${appPath}/playlist.json`, '{}', (err) => {
                    if (err) console.error(err);
                    resolve();
                })
            } else {
                resolve();
            }
        });
    });
    await check;
    fs.promises.readFile(`${appPath}/playlist.json`, (err) => {
        if (err) console.log(err);
    }).then(async file => {
        playlistFile = JSON.parse(file.toString());
        let getRandomInt = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        let plID = getRandomInt(100000000, 999999999);
        playlistFile[plID] = {
            name: plName,
            image: '../assets/no_album.svg',
            files: [],
            id: plID
        };
        let formattedMetadata = JSON.stringify(playlistFile);
        fs.writeFile(`${appPath}/playlist.json`, formattedMetadata, err => {
            if (err) console.error(err);
            postMessage(true);
        });
    });
}