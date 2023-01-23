import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'

let notification
const showNotification = async(message, type, duration = 1800) => {
    let classes, icon_classes
    if(type === 'success') {
        classes = 'notification notification-success'
        icon_classes = 'icon icon-success'
    } else if(type === 'error') {
        classes = 'notification notification-error'
        icon_classes = 'icon icon-alert'
    } else {
        classes = 'notification notification-info'
        icon_classes = 'icon icon-alert'
    }

    if(notification) {
        notification.hideToast()
    }

    notification = Toastify({
        text: '<div class="d-flex align-items-center"><div class="col-2 d-flex justify-content-center"><span class="' + icon_classes + '"></span></div><div class="col-10">'+message+'</div></div>',
        offset: {
            y: 40
        },
        duration: duration,
        className: classes,
        close: false,
        stopOnFocus: false,
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        escapeMarkup: false,
        onClick: function(){
            notification.hideToast()
        }
    }).showToast();
}

const hideNotification = () => {
    if(notification) notification.hideToast()
}

export {
    showNotification,
    hideNotification
}