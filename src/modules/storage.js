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
                this.config = JSON.parse(data)
                this.categories = this.config['categories']
            })
        })
    }

    getItem(key) {
        if (!this.config[key]) throw `Key "${key}" does not exist`;
        return this.config[key]
    }

    setKey(key, value, category) {
        if (!key || !value) throw `No key or value was provided`
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

    getCategory(category) {
        if (!this.categories[category]) throw `Category ${category} does not exist`
        return this.categories[category]
    }

    keyExists(key) {
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

    deleteKey(key) {
        if (!key) throw `No key was provided`
        delete this.config[key]
        this.searchKeyInCategoryAndRemove(key)
    }

    searchKeyInCategoryAndRemove(key) {
        Object.keys(this.categories).forEach(item => {
            const index = this.categories[item].indexOf(key)
            console.log(index)
            if (index) this.categories[item].splice(index, 1)
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

export default FiretailStorage