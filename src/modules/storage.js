import {app} from 'electron'
import {resolve} from 'path'
import {readFile, writeFileSync, writeFile, access, constants} from 'fs'

class FiretailStorage {
    configFilePath = resolve(app.getPath('userData'), 'config.json')
    config = null
    categories = null

    constructor() {
        access(this.configFilePath, constants.F_OK, (err) => {
            if (err) {
                writeFileSync(this.configFilePath, '{categories: {}}')
            }
            readFile(this.configFilePath, {}, (err, data) => {
                if (err) throw err;
                this.config = new Map(Object.entries(JSON.parse(data)))
            })
        })
    }

    getItem(key) {
        if (!this.config.has(key)) throw `Key "${key}" does not exist`;
        return this.config.get(key)
    }

    setKey(key, value) {
        this.config.set(key, value)
        this.writeConfig()
    }

    keyExists(key) {
        return this.config.has(key)
    }

    writeConfig() {
        writeFile(this.configFilePath, JSON.stringify(this.config), (err) => {
            if (err) throw err;
        })
    }

    deleteKey(key) {
        this.config.delete(key)
    }

    get keys() {
        return Array.from(this.config.keys())
    }

    get fullConfig() {
        return this.config
    }
}

export default FiretailStorage