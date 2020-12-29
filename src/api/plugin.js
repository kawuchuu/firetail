import Sidebar from './sidebar'
import Router from './router'

class Plugin {
    constructor(name) {
        this.name = name
        this.sidebar = new Sidebar()
        this.router = new Router()

        console.log('Created new plugin instance...')
        console.log(`Plugin name: ${this.name}`)
    }
}

export default Plugin