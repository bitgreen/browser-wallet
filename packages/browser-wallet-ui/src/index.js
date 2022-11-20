import { updateElement } from './screens.js'
import { goToScreen } from './screens/index.js'

/* import all css files */
import './styles/main.css'
import './styles/icomoon.css'
import 'bootstrap/dist/css/bootstrap.css'

const initUi = async() => {
    await updateElement('body', 'init', {}, false)
}

export {
    initUi,
    goToScreen
}