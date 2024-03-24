import Toastify from 'toastify-js'
import {isIOs} from "@bitgreen/browser-wallet-utils";

let notification
const showNotification = async(message, type, duration = 2000, offset = 44) => {
  offset += isIOs() ? 40 : 0 // Additional offset for ios

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
      y: offset
    },
    duration: duration,
    className: classes,
    close: false,
    stopOnFocus: false,
    gravity: "top",
    position: "left",
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