chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.getThirdparty){
            chrome.storage.sync.get("thirdparty",function (items) {
                sendResponse({thirdparty: !items["thirdparty"]["default"]});
            });
            return true;
        }
        if (request.getCookieLivetime){
            var url = request.getCookieLivetime.url || "http://*.*";
            url = (url.indexOf("http") === -1) ? "http://" + url + "/*" : url + "/*";
            chrome.contentSettings.cookies.get({
                "primaryUrl": url
            },function (details) {
                var val = details.setting;
                var livetime;
                if (val === "allow"){
                    livetime = 0;
                } else if (val === "session_only"){
                    livetime = 1;
                } else {
                    livetime = 2;
                }
                sendResponse({cookieLivetime:livetime});
            });
            return true;
        }
        if (request.setThirdparty){
            var thirdparty = request.setThirdparty.value;
            chrome.storage.sync.get("thirdparty",function (items) {
                items["thirdparty"]["default"] = !thirdparty;
                chrome.storage.sync.set(items,updateSettings);
            });
            return true;
        }
        if (request.setCookieLivetime){
            var cookielivetime = request.setCookieLivetime.value;
            var pattern = request.setCookieLivetime.pattern;
            chrome.storage.sync.get("logincookies",function (items) {
                if (pattern === "<all_urls>"){
                    items.logincookies.default = cookielivetime;
                } else {
                    var url = getDomainFromURLString(pattern);
                    if (items.logincookies.hasOwnProperty(url)){
                        items.logincookies[url]["setting"]["login"] = cookielivetime;
                    }
                }
            });

            chrome.contentSettings.cookies.set({
                primaryPattern : pattern,
                setting : cookielivetime
            });
            return true;
        }
        if (request.updateSettings){
            updateSettings();
            return true;
        }
    });

function cookieTransformation(cookie) {
    var url = "http://" + cookie.domain;
    delete cookie["hostOnly"];
    delete cookie["session"];
    cookie["url"] = url;
    return cookie;
}

var settings = {};
updateSettings();
function updateSettings() {
    chrome.storage.sync.get("thirdparty",function (items) {
        settings = items;
    });
}
chrome.runtime.onStartup.addListener(updateSettings);
chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get("logincookies",function (items) {
        for (entry in items.logincookies){
            entry = items.logincookies[entry];
            if (items.logincookies.default !== entry) {
                var setting = entry.setting;
                if (setting.login && items.logincookies.default === 1) {
                    chrome.cookies.set(cookieTransformation(entry.cookie.value));
                }
            }
        }
    });
});
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.privacy.websites.thirdPartyCookiesAllowed.set({value: true});
    chrome.storage.sync.set({thirdparty:{default: false}});
    var logincookies = {
        logincookies : {
            default : 1,
            "famkaefer.de" : {
                url : "http://famkaefer.de",
                cookie : {
                    name : "PHPSESSID",
                    value : {}
                },
                setting : {
                    login : true,
                }
            },
            "google.de": {
                url: "http://google.de",
                cookie: {
                    name: "SSID",
                    value: {}
                },
                setting: {
                    login: true,
                },
            },
            "youtube.com": {
                url: "http://www.youtube.com",
                cookie: {
                    name: "SSID",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "facebook.com": {
                url: "http://facebook.com",
                cookie: {
                    name: "c_user",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "google.com": {
                url: "http://google.com",
                cookie: {
                    name: "SSID",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "ebay.de": {
                url: "http://ebay.de",
                cookie: {
                    name: "cid",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "ebay-kleinanzeigen.de": {
                url: "http://www.ebay-kleinanzeigen.de",
                cookie: {
                    name: "JSESSIONID",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "t-online.de": {
                url: "http://tipi.api.t-online.de",
                cookie: {
                    name: "JSESSIONID",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "yahoo.com": {
                url: "http://yahoo.com",
                cookie: {
                    name: "T",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "instagram.com": {
                url: "http://www.instagram.com",
                cookie: {
                    name: "sessionid",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "twitter.com": {
                url: "http://twitter.com",
                cookie: {
                    name: "auth_token",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "spiegel.de": {
                url: "http://spiegel.de",
                cookie: {
                    name: "boSession",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "bild.de": {
                url: "http://www.bild.de",
                cookie: {
                    name: "JSESSIONID",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
            "mobile.de": {
                url: "http://mobile.de",
                cookie: {
                    name: "vi",
                    value: {}
                },
                setting: {
                    login: true,
                }
            },
        }
    };
    chrome.storage.sync.set(logincookies);
});

function getDomainFromURLString(url) {
    var domain;
    if (url.indexOf("://") > -1){
        domain = url.split("/")[2];
    } else {
        domain = url.split("/")[0];
    }
    domain = domain.split(":")[0];
    return domain;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    chrome.storage.sync.get("logincookies",function (items) {
        var url = getDomainFromURLString(tab.url);
        if (items.logincookies.hasOwnProperty(url)){
            if (items.logincookies[url]["setting"]["login"]) {
                chrome.cookies.getAll({url: tab.url}, function (cookies) {
                    for (cookie of cookies) {
                        if (cookie.name === items.logincookies[url]["cookie"]["name"]) {
                            items.logincookies[url]["cookie"]["value"] = cookie;
                        }
                    }
                    chrome.storage.sync.set(items);
                });
            }
        }
        for (entry in items.logincookies){
            entry = items.logincookies[entry];
            if (items.logincookies.default !== entry) {
                var setting = entry.setting;
                if (setting.login && items.logincookies.default === 1) {
                    chrome.cookies.set(cookieTransformation(entry.cookie.value));
                }
            }
        }
    });
});

var url;
chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        if (details.type === "main_frame"){
            url = getDomainFromURLString(details.url);
        }
        var headers = [];
        var block = false;
        if (settings.thirdparty) {
            if (settings.thirdparty.hasOwnProperty(url)) {
                block = settings.thirdparty[url] || false;
            } else {
                block = settings.thirdparty.default || false;
            }
        }
        if (block) {
            for (var i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name !== "Set-Cookie") {
                    headers.push(details.responseHeaders[i]);
                } else {
                    if (url === getDomainFromURLString(details.url)) {
                        headers.push(details.responseHeaders[i]);
                    }
                }
            }
        } else {
            headers = details.responseHeaders;
        }
        return {responseHeaders: headers};
    },
    {urls: ["<all_urls>"],
    types: ["main_frame","sub_frame"]},
    ["responseHeaders","blocking"]);