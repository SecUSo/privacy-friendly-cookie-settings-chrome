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

var settings = {};
updateSettings();
function updateSettings() {
    chrome.storage.sync.get("thirdparty",function (items) {
        settings = items;
    });
}
chrome.runtime.onStartup.addListener(updateSettings);
chrome.runtime.onInstalled.addListener(function () {
    chrome.privacy.websites.thirdPartyCookiesAllowed.set({value: true});
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

var tabs = {};
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.url){
        tabs[tabId] = getDomainFromURLString(changeInfo.url);
    }
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