import express from 'express'
import { constants, mkdirSync } from 'fs'
import { access } from 'fs/promises'

export default {
    async startServer(appLoc) {
        let doAccess = access(`${appLoc}/images/`, constants.F_OK | constants.W_OK, (err) => {
            if (err.code == 'ENOENT') mkdirSync(`${appLoc}/images/`)
        })
        await doAccess
        let imgServer = express().use(express.static(`${appLoc}/images/`))
        imgServer.listen(56745, 'localhost', err => {
            if (err) throw err
            console.log('Image server now running...')
        })
    }
}