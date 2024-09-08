import {app, ipcMain} from 'electron'
import {resolve} from 'path'
import {readFile, writeFileSync, writeFile, access, constants} from 'fs'

// TODO: replace all of the 'any' types
class FiretailStorage {
    configFilePath = resolve(app.getPath('userData'), 'config.json')
    config:any = null
    categories:any = null

    constructor() {
        access(this.configFilePath, constants.F_OK, (err) => {
            if (err) {
                writeFileSync(this.configFilePath, '{"categories": {}}')
            }
            readFile(this.configFilePath, {}, (err, data:string) => {
                if (err) throw err;
                this.config = JSON.parse(data)
                this.categories = this.config['categories']
            })
        })

        ipcMain.handle('getKey', (event, key) => {
            return this.getItem(key)
        })

        ipcMain.on('setKey', (event, values) => {
            this.setKey(values[0], values[1], values[2])
        })

        ipcMain.on('deleteKey', (event, key) => {
            this.deleteKey(key)
        })

        ipcMain.handle('keyExists', (event, key) => {
            return this.keyExists(key)
        })

        ipcMain.handle('keys', () => {
            return this.keys
        })

        ipcMain.handle('getCategory', (event, category) => {
            return this.getCategory(category)
        })
    }

    getItem(key: string) {
        if (this.config[key] === undefined) throw `Key "${key}" does not exist`;
        return this.config[key]
    }

    setKey(key:string, value:any, category:string) {
        if (!key || value === undefined) throw `No key or value was provided`
        if (key === 'categories') throw 'The "categories" key is reserved and cannot be set'
        this.config[key] = value
        if (category) {
            if (!this.categories[category]) {
                this.categories[category] = []
            }
            this.searchKeyInCategoryAndRemove(key)
            this.categories[category].push(key)
            this.config['categories'] = this.categories
        }
        this.writeConfig()
    }

    getCategory(category:string) {
        if (!this.categories[category]) throw `Category ${category} does not exist`
        return this.categories[category]
    }

    keyExists(key:string) {
        if (!key) throw `No key was provided`
        return !!this.config[key]
    }

    writeConfig() {
        const mainConfig = this.config
        mainConfig.categories = this.categories
        writeFile(this.configFilePath, JSON.stringify(mainConfig), (err) => {
            if (err) throw err;
        })
    }

    deleteKey(key:string) {
        if (!key) throw `No key was provided`
        delete this.config[key]
        this.searchKeyInCategoryAndRemove(key)
    }

    searchKeyInCategoryAndRemove(key:string) {
        Object.keys(this.categories).forEach(item => {
            const index = this.categories[item].indexOf(key)
            console.log(index)
            if (index !== -1) this.categories[item].splice(index, 1)
            console.log(this.categories[item])
        })
    }

    get keys() {
        return Object.keys(this.config)
    }

    get fullConfig() {
        return this.config
    }
}

export default FiretailStorage;