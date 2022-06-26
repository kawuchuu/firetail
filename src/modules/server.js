import express from 'express'
import { constants, mkdirSync, access } from 'fs'
import cors from 'cors'
import { resolve } from 'path'
import {createServer} from 'net'
//import isPortReachable from 'is-port-reachable'
import { dialog } from 'electron'

const app = express()

const startServer = async (appLoc, win) => {
    access(`${appLoc}/images/`, constants.F_OK | constants.W_OK, (err) => {
        if (err) mkdirSync(`${appLoc}/images/`)
    })
    app.use(cors())
    let staticRoot = resolve(__dirname, 'static')
    console.log(staticRoot)
    if (process.env.NODE_ENV === 'development') {
        staticRoot = resolve(__dirname, '../public/static')
        app.use('/', express.static(staticRoot))
    } else {
        app.use('/', express.static(staticRoot))
    }
    app.use('/images', express.static(`${appLoc}/images/`))
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });
    for (let testPort = 56741; testPort < 56752; testPort++) {
        try {
            await new Promise((res, rej) => {
                app.listen(testPort, 'localhost', () => {
                    // dialog.showErrorBox("port", testPort);
                    app.set('port', testPort)
                    console.log('Server now running...')
                    res();
                }).on('error', err => {
                    rej(err);
                });
            });
            break;
        } catch {
            if (testPort >= 56751) {
                const msg = "ERROR: Unable to establish a server port. Please close any applications using the following range: 56741-56751."
                dialog.showErrorBox("Failed to establish a server port", msg)
            }
        }
    }
    
    app.get('/', (req, res) => {
        res.send('stop peeking!')
    })
    app.get('/spconnect', (req, res) => {
        if (req.query.error) {
            res.sendFile(staticRoot + '/spotifyconnect.html')
            win.webContents.send('spotifyAuthFinish', {error: req.query.error})
            return;
        }
        if (req.query.code && req.query.state) {
            const state = req.query.state
            const code = req.query.code
            win.webContents.send('spotifyAuthFinish', {state: state, code: code})
        }
        res.sendFile(staticRoot + '/spotifyconnect.html')
    })
}

export default {
    startServer,
    app
}