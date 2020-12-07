import express from 'express'
import { constants, mkdirSync, access } from 'fs'
import db from './database'
import axios from 'axios'
import qs from 'qs'
import http from 'http'

let app = express()
let server = http.createServer(app)

let startServer = async (appLoc, win) => {
    access(`${appLoc}/images/`, constants.F_OK | constants.W_OK, (err) => {
        if (err) mkdirSync(`${appLoc}/images/`)
    })
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        next();
    });
    app.use(express.static(`${appLoc}/images/`))
    app.set('port', 0)
    server.listen(app.get('port'), () => {
        console.log(`Server running on port ${server.address().port}...`)
    })

    app.get('/login', (ref, res) => {
        let clientID = ref.query.client_id
        let clientAuth = ref.query.client_auth
        if (!clientID || !clientAuth) return res.send('No clientID or clientAuth was provided.')
        if (!clientID.length == 32 || !clientAuth.length == 32) return res.send('Invalid clientID or clientAuth.')
        db.updateSpotifyClientIDField(clientID)
        db.updateSpotifyClientAuthField(clientAuth)
        res.redirect(`https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A${server.address().port}%2Fcallback&scope=user-read-playback-state`)
    })

    app.get('/callback', (ref, res) => {
        if (ref.query.error) {
            res.send(`Authorisation failed! Spotify responded with this: ${ref.query.error}`)
        } else {
            let clientAuth = db.fetchSpotifyDetails().clientAuth
            axios({
                method: 'POST',
                url: 'https://accounts.spotify.com/api/token',
                data: qs.stringify({
                    grant_type: 'authorization_code',
                    code: ref.query.code,
                    redirect_uri: `http://localhost:${server.address().port}/callback`
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${clientAuth}`
                }
            }).then(resp => {
                console.log(resp.data)
                db.updateSpotifyCurrentValidTokenField(resp.data.access_token)
                if (resp.data.refresh_token) {
                    db.updateSpotifyRefreshTokenField(resp.data.refresh_token)
                }
            }).catch(err => {
                console.log(err.response.data)
            })
            win.webContents.send('spotifyAuthFinish')
            win.focus()
            res.send('Authorisation completed successfully! You may now close this tab.')
        }
    })
}

export default {
    startServer,
    server
}