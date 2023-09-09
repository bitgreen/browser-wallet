import { isAndroid, isIOs, isMacOs, isStandaloneApp } from "@bitgreen/browser-wallet-utils";

const renderTemplate = async(template, params = {}) => {
    let template_data = await loadTemplate(template)

    if(Object.keys(params).length > 0) {
        // replace variables
        return interpolate(template_data, params)
    }

    return template_data
}

const loadTemplate = async(template) => {
    let result = await fetch(`./components/${template}.html`).catch(function(e) {
        return false
    })

    if(!result) {
        return false
    }

    return result.text()
}

const interpolate = (template_data, params) => {
    let output_data = template_data?.toString()
    let param_values = Object.entries(params)

    for(let param of param_values) {
        let name = param[0]?.toString()
        let value = param[1]

        if(value === undefined || value === null) {
            value = ''
        } else {
            value = value.toString()
        }

        output_data = output_data.replaceAll('${'+name+'}', value)
    }

    return output_data
}

const updateElement = async(element, template_name = 'false', params = {}, append = true) => {
    const template_data = template_name !== '' ? await renderTemplate(template_name, params) : ''

    let el = document.querySelector('#root') // default element
    if(element === 'body') {
        const url_params = new URLSearchParams(window.location.search)

        el = document.getElementsByTagName('body')[0]

        // Add class to body, so we can apply custom CSS.
        if(isIOs()) {
            el.classList.add('ios')
        } else if(isAndroid()) {
            el.classList.add('android')
        } else if(isMacOs() && !url_params.get('popup')) {
            el.classList.add('macos')
        }

        if(isStandaloneApp()) {
            el.classList.add('app')
        }
    } else if(element) {
        el = document.querySelector(element)
    }

    if(!el) {
        console.log(`Element not found. [${element}]`)
        return false;
    }

    if(append) {
        el.innerHTML += template_data
    } else {
        el.innerHTML = template_data
    }


    return true
}

const resetElement = async(element) => {
    return updateElement(element, '', false, false)
}

export {
    renderTemplate,
    updateElement,
    resetElement
}
