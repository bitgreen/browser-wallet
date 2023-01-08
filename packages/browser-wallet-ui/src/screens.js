const renderTemplate = async(template, params = {}) => {
    let template_data = await loadTemplate(template)

    if(Object.keys(params).length > 0) {
        // replace variables
        return interpolate(template_data, params)
    }

    return template_data
}

const loadTemplate = async(template) => {
    const response = await fetch(`./components/${template}.html`).catch(function(e) {
        return false
    })

    if(!response) {
        return false
    }

    return response.text()
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
        el = document.getElementsByTagName('body')[0]
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
    updateElement,
    resetElement
}
