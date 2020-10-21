import express from 'express'
import { constants, mkdirSync, access } from 'fs'

let startImageServer = async appLoc => {
    access(`${appLoc}/images/`, constants.F_OK | constants.W_OK, (err) => {
        if (err) mkdirSync(`${appLoc}/images/`)
    })
    let imgServer = express()
    imgServer.use(express.static(`${appLoc}/images/`))
    imgServer.listen(56741, 'localhost', err => {
        if (err) return console.log(err)
        console.log('Image server now running...')
    })
}

export default startImageServer