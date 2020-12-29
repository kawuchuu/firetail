import router from '../../router'

class Router {

    constructor() {
        this.router = router
    }

    addRoute(path, component) {
        router.matcher.addRoutes([{
            path: path,
            component: component.default,
            name: 'test'
        }])
        console.log('Added the route yeah')
    }

}

export default Router