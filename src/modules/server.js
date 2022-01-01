import express from 'express'
import { constants, mkdirSync, access } from 'fs'
import cors from 'cors'
import { resolve } from 'path'

let app = express()

let startServer = async (appLoc, win) => {
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
    app.set('port', 56741)
    app.listen(app.get('port'), 'localhost', err => {
        if (err) return console.log(err)
        console.log('Server now running...')
    })
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