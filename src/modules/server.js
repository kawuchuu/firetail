import express from 'express'
import { constants, mkdirSync, access } from 'fs'
import cors from 'cors'

let app = express()

let startServer = async (appLoc, win) => {
    access(`${appLoc}/images/`, constants.F_OK | constants.W_OK, (err) => {
        if (err) mkdirSync(`${appLoc}/images/`)
    })
    app.use(cors())
    app.use(express.static(`${appLoc}/images/`))
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
            res.send(`Authorisation failed! Spotify responded with this: ${req.query.error}`)
            return;
        }
        const state = req.query.state
        const code = req.query.code
        res.send('Got a response! Passing to Firetail now...')
        win.webContents.send('spotifyAuthFinish', {state: state, code: code})
    })
}

export default {
    startServer,
    app
}