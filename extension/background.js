const extension_id = chrome.runtime.id;

let password = null;
let password_expire = 30; // expire after X minutes
let password_timeout = null;

let pending_extrinsics = []
let pending_extrinsics_timeout = null;

BWMessage = "";
timeout = 0;
chrome.runtime.onInstalled.addListener(() => {
    console.log("background");
});

if(get_browser() !== 'firefox') {
    chrome.alarms.onAlarm.addListener(function(alarm) {
        if(alarm.name === 'password_reset') {
            chrome.storage.session.remove(['password'])
        }

        if(alarm.name === 'check_extrinsics') {
            chrome.storage.local.get(['pending_extrinsics'], function(result) {
                let new_pending_extrinsics = result.pending_extrinsics

                // stop alarm if no pending extrinsics
                if(!new_pending_extrinsics || new_pending_extrinsics.length === 0) {
                    chrome.alarms.clear('check_extrinsics')
                    return;
                }

                parse_extrinsics(new_pending_extrinsics)
            });
        }
    });
}

function get_browser() {
    let userAgent = navigator.userAgent;
    let browserName = '';

    if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
        browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
        browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
        browserName = "edge";
    }

    return browserName;
}

function show_popup(url, popup_height = 600) {
    if(get_browser() === 'safari') {
        chrome.windows.create({
            url: url,
            type: 'popup',
            focused: true,
            width: 400,
            height: popup_height
        });
    } else {
        chrome.windows.getCurrent(function (win) {
            let width = win.width;
            let height = win.height;
            let top = win.top;
            let left = win.left;

            chrome.tabs.create({
                url: chrome.runtime.getURL(url),
                active: false
            }, function (tab) {
                // get windows properties

                    // adjust position
                    top = top + 80;
                    left = left + width - 400 - 100;

                    // After the tab has been created, open a window to inject the tab
                    chrome.windows.create({
                        tabId: tab.id,
                        type: 'popup',
                        focused: true,
                        width: 400,
                        height: popup_height,
                        left,
                        top
                        // incognito, top, left, ...
                    });


            });
        });
    }
}
function parse_extrinsics(extrinsics) {
    const current_timestamp = Date.now()

    for(let ex in extrinsics) {
        if(get_browser() === 'firefox') {
            const extrinsic = extrinsics[ex]

            // expired after 0.5 sec
            if((current_timestamp - extrinsic.last_refresh) >= 500 || !extrinsic.last_refresh) {
                send_extrinsic_message(extrinsic.id, 'expired')
            }
        } else {
            const extrinsic_id = extrinsics[ex]

            chrome.storage.local.get([String(extrinsic_id)], function(result) {
                const extrinsic = result[String(extrinsic_id)]

                // expired after 0.5 sec
                if((current_timestamp - extrinsic.last_refresh) >= 500 || !extrinsic.last_refresh) {
                    send_extrinsic_message(extrinsic_id, 'expired')
                }
            });
        }
    }
}
function send_extrinsic_message(extrinsic_id, status = 'pending') {
    if(get_browser() === 'firefox') {
        let extrinsics = pending_extrinsics.filter(function(ex) {
            return ex.id === extrinsic_id
        })
        let extrinsic = extrinsics[0]

        browser.tabs.get(extrinsic.tab_id).then(function() {
            if (!browser.runtime.lastError && extrinsic) {
                browser.tabs.sendMessage(extrinsic.tab_id, {
                    type: 'EXTRINSIC',
                    pallet: extrinsic.pallet,
                    call: extrinsic.call,
                    status: status,
                    id: extrinsic_id
                });
            }
        });
    } else {
        chrome.storage.local.get([String(extrinsic_id)], function(result) {
            const extrinsic = result[String(extrinsic_id)]

            if(!extrinsic) {
                return;
            }

            chrome.tabs.get(extrinsic.tab_id, function() {
                if (!chrome.runtime.lastError && extrinsic) {
                    chrome.tabs.sendMessage(extrinsic.tab_id, {
                        type: 'EXTRINSIC',
                        pallet: extrinsic.pallet,
                        call: extrinsic.call,
                        status: status,
                        id: extrinsic_id
                    });
                }
            });
        });
    }

    if(status !== 'pending') {
        // remove from the list
        if(get_browser() === 'firefox') {
            pending_extrinsics = pending_extrinsics.filter(function(ex) {
                return ex.id !== extrinsic_id
            })
        } else {
            chrome.storage.local.get(['pending_extrinsics'], function(result) {
                const new_pending_extrinsics = result.pending_extrinsics.filter(function(ex) {
                    return ex !== extrinsic_id
                })

                chrome.storage.local.set({ pending_extrinsics: new_pending_extrinsics })
                chrome.storage.local.get([String(extrinsic_id)], function(result) {
                    chrome.storage.local.remove(extrinsic_id)
                });
            });
        }
    }
}

// it uses a chrome messaging listener
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "[info] msg from a content script:" + sender.tab.url :
            "[info] msg from the extension");

        if (request.command === "save_password") {
            if(get_browser() === 'firefox') {
                password = request.password
                password_timeout = setTimeout(function () {
                    password = null;
                }, 1000 * 60 * password_expire)
            } else {
                chrome.storage.session.set({ password: request.password })
            }

            // set timer
            chrome.alarms.create('password_reset', { delayInMinutes: password_expire });

            return true;
        }

        if (request.command === "request_password") {
            if(get_browser() === 'firefox') {
                sendResponse(password)
                return password
            } else {
                chrome.storage.session.get(['password'], function(result) {
                    sendResponse(result.password)
                })
            }

            return true;
        }

        if (request.command === "refresh_password") {
            // reset timer
            if(get_browser() === 'firefox') {
                clearTimeout(password_timeout);
                password_timeout = setTimeout(function () {
                    password = null;
                }, 1000 * 60 * password_expire)
            } else {
                chrome.alarms.clear('password_reset', function() {
                    chrome.alarms.create('password_reset', { delayInMinutes: password_expire })
                })
            }

            sendResponse(true)
            return true;
        }

        if (request.command === "lock_wallet") {
            if(get_browser() === 'firefox') {
                password = null
                clearTimeout(password_timeout)
            } else {
                chrome.alarms.clear('password_reset')
                chrome.storage.session.remove(['password'])
            }

            sendResponse(true)
            return true;
        }

        // manage transfer command
        if (request.command === "transfer") {
            if (request.recipient !== null && request.amount !== null) {
                // create new windows for the transfer funds
                let url = 'window.html?command=transfer&recipient=' + encodeURI(request.recipient) + '&amount=' + encodeURI(request.amount) + '&domain=' + encodeURI(request.domain);
                show_popup(url);

                sendResponse(true)
                return true;
            }
        }

        // manage tx command used to submit extrinsics
        if (request.command === "tx") {
            if (request.pallet !== null && request.call !== null && request.parameters !== null) {
                const current_timestamp = Date.now();
                const extrinsic_id = current_timestamp;

                // create new windows for the extrinsic
                let url = 'window.html?command=tx&recipient=' + encodeURI(request.recipient) + '&pallet=' + encodeURI(request.pallet) + '&call=' + encodeURI(request.call) + '&parameters=' + encodeURI(request.parameters) + '&domain=' + encodeURI(request.domain) + '&id=' + extrinsic_id;
                show_popup(url, 700);

                // fire init event
                if(get_browser() === 'firefox') {
                    browser.tabs.query({active: true, currentWindow:true}).then(function(tabs) {
                        const tab_id = tabs[0].id

                        pending_extrinsics.push({
                            id: extrinsic_id,
                            tab_id: tab_id,
                            pallet: request.pallet,
                            call: request.call,
                            status: 'pending',
                            last_refresh: current_timestamp,
                        })

                        send_extrinsic_message(extrinsic_id, 'pending')

                        clearTimeout(pending_extrinsics_timeout)
                        pending_extrinsics_timeout = setInterval(function () {
                            parse_extrinsics(pending_extrinsics)
                        }, 1000)
                    })
                } else {
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        const tab_id = tabs[0].id

                        chrome.storage.local.get(['pending_extrinsics'], function (result) {
                            let new_pending_extrinsics = result.pending_extrinsics ? result.pending_extrinsics : []

                            new_pending_extrinsics.push(extrinsic_id)

                            chrome.storage.local.set({pending_extrinsics: new_pending_extrinsics})

                            chrome.storage.local.set({
                                [extrinsic_id]: {
                                    tab_id: tab_id,
                                    pallet: request.pallet,
                                    call: request.call,
                                    status: 'pending',
                                    last_refresh: current_timestamp
                                }
                            })

                            send_extrinsic_message(extrinsic_id, 'pending')

                            // set alarm if is not set
                            chrome.alarms.get('check_extrinsics', function (result) {
                                if (!result) {
                                    chrome.alarms.create('check_extrinsics', {periodInMinutes: 0.016}) // every ~1 seconds
                                }
                            });
                        })
                    });
                }

                sendResponse(true)
                return true;
            }
        }

        if (request.command === "refresh_extrinsic") {
            let current_timestamp = Date.now()
            let extrinsic_refreshed = false

            if(get_browser() === 'firefox') {
                for(let ex in pending_extrinsics) {
                    const extrinsic = pending_extrinsics[ex]

                    if(extrinsic.id === parseInt(request.id)) {
                        if(request.status === 'submitted') {
                            send_extrinsic_message(extrinsic.id, 'submitted')
                        } else if(request.status === 'denied') {
                            send_extrinsic_message(extrinsic.id, 'denied')
                        } else {
                            extrinsic_refreshed = true
                            pending_extrinsics[ex].last_refresh = current_timestamp
                        }
                    }
                }

                sendResponse(extrinsic_refreshed)
            } else {
                chrome.storage.local.get(['pending_extrinsics'], function(result) {
                    for(let extrinsic in result.pending_extrinsics) {
                        const extrinsic_id = result.pending_extrinsics[extrinsic]

                        if(parseInt(extrinsic_id) === parseInt(request.id)) {
                            if(request.status === 'submitted') {
                                send_extrinsic_message(extrinsic_id, 'submitted')
                            } else if(request.status === 'denied') {
                                send_extrinsic_message(extrinsic_id, 'denied')
                            } else {
                                extrinsic_refreshed = true

                                chrome.storage.local.get([String(extrinsic_id)], function(result) {
                                    let data = result[String(extrinsic_id)]
                                    data.last_refresh = current_timestamp
                                    chrome.storage.local.set({ [String(extrinsic_id)]: data })
                                });
                            }
                        }
                    }

                    sendResponse(extrinsic_refreshed)
                });
            }

            return true;
        }

        // manage sign-in command
        if (request.command === "signin") {
            //sendResponse({answer: "OK"});
            // create new windows for authentication
            let url = 'window.html?command=signin&domain=' + encodeURI(request.domain);
            show_popup(url);

            // Will be called asynchronously from sendAnswerBW()
            sendAnswerBW(function (msg) {
                console.log("sending data back to web page", msg);
                sendResponse(msg);
            });
            // to keep open the channel for the answer we returns true
            return true;
        }

        if (request.command === "portfolio") {
            // create new windows for the extrinsic
            let url = 'window.html?command=portfolio';
            show_popup(url);
        }

        // check if extension is installed
        if (request.command === "check") {
            sendResponse({status: 'OK'});
            // return true;
        }

        // manage answer to sign-in command
        if (request.command === "signinanswer") {
            console.log("signinanswer", request.message);
            BWMessage = request.message;
        }

        // callback function to send the answer from the extension to the web page. It's quite complicated but it's the only way.
        function sendAnswerBW(callback) {
            // wait for signature with a timeout of 60 seconds
            function waitforSignature() {
                // exit for timeout of 1 minute
                if (timeout >= 60) {
                    BWMessage = "";
                    timeout = 0;
                    return;
                }
                if (BWMessage === "") {
                    setTimeout(waitforSignature, 1000); //wait 1 second and check again
                    timeout = timeout + 1;
                    return;
                } else {
                    // execute the call back sending the message
                    console.log("Sending BWMessage from background.js:", BWMessage);
                    callback(BWMessage);
                    BWMessage = "";
                    timeout = 0;
                }
            }

            // call the waiting function for the signature
            waitforSignature();
        }
    }
);
