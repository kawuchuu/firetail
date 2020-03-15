const express = require('express');

onmessage = (userData) => {
    let imgServer = express();
    imgServer.use(express.static(`${userData.data}/Cache/`));
    console.log(`${userData.data}/Cache/`)
    imgServer.listen(56743, 'localhost', () => {
        console.log('Image server running on: http://localhost:56743');
    })
}