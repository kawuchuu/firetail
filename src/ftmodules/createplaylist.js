const fs = require('fs');
const fsconst = require('fs').constants;
const sharp = require('sharp');

onmessage = async (plName) => {
    console.log(plName)
    let appPath = plName.data[1];
    let plImg = plName.data[2];
    console.log(plImg);
    let plDesc = plName.data[3];
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
        let plFinImage = '../assets/no_album.svg';
        if (plImg != '../assets/no_album.svg') {
            let checkImg = await sharp(Buffer.from(plImg)).resize(512).png().toBuffer();
            console.log(checkImg);
            plFinImage = `${appPath.replace(/[\\]/g, "/")}/images/${plID}.png`
            fs.writeFile(`${appPath}/images/${plID}.png`, checkImg, err => {
                if (err) console.error(err);
            })
        }
        playlistFile[plID] = {
            'name': plName,
            'desc': plDesc,
            image: plFinImage,
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