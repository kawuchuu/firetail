import State from '../store/state'

class Sidebar extends State {

    addItem(type, options) {
        let newItem = options
        newItem['type'] = type
        super.commit('nav', 'addItemToNav', newItem)
    }
}

export default Sidebar