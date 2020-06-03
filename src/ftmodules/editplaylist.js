const sharp = require('sharp');
const fs = require('fs');

let getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

onmessage = async editpl => {
    let newImg = editpl.data[0];
    console.log(newImg);
    let itemClicked = editpl.data[1];
    let appPath = editpl.data[2];
    console.log(appPath);
    let plName = editpl.data[3];
    let plDesc = editpl.data[4];

    fs.promises.readFile(`${appPath}/playlist.json`, err => {
        if (err) console.error(err);
    }).then(async file => {
        let pl = JSON.parse(file.toString());
        let plID = itemClicked;
        let plImg = pl[itemClicked].image;
        let plFiles = pl[itemClicked].files;
        if (newImg != '') {
            if (plImg != '../assets/no_album.svg') {
                fs.unlinkSync(pl[itemClicked].image);
            }
            delete pl[itemClicked];
            plID = getRandomInt(100000000, 999999999);
            let checkImg = await sharp(Buffer.from(newImg)).resize(512).png().toBuffer();
            console.log(checkImg);
            plImg = `${appPath.replace(/[\\]/g, "/")}/images/${plID}.png`
            fs.writeFile(`${appPath}/images/${plID}.png`, checkImg, err => {
                if (err) console.error(err);
            });
        }
        pl[plID] = {
            name: plName,
            desc: plDesc,
            id: plID,
            image: plImg,
            files: plFiles
        }
        console.log('lol')
        fs.promises.writeFile(`${appPath}/playlist.json`, JSON.stringify(pl), (err) => {
            if (err) console.error(err);
        })
        postMessage(pl);
    })
}