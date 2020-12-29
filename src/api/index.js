import Plugin from './plugin'

function Api(name) {
    return new Plugin(name)
}

Api.Plugin = Plugin
Api.Sidebar = require('./sidebar')

export default Api