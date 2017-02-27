chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.getThirdparty){
            chrome.privacy.websites.thirdPartyCookiesAllowed.get({},function (details) {
                sendResponse({thirdparty : details.value});
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
            chrome.privacy.websites.thirdPartyCookiesAllowed.set({value:thirdparty});
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
    });

var settings = {};

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.sync.get("thirdparty",function (items) {
        settings = items;
    })
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

chrome.webRequest.onHeadersReceived.addListener(
    function (details) {
        var url = getDomainFromURLString(details.url);
        var headers = [];
        var block = false;
        if (settings.thirdparty && settings.thirdparty.hasOwnProperty(url)) {
            block = settings.thirdparty[url] || false;
            console.log(block);
        }
        if (block) {
            for (var i = 0; i < details.responseHeaders.length; i++) {
                if (details.responseHeaders[i].name !== "Set-Cookie") {
                    headers.push(details.responseHeaders[i]);
                } else {
                    var val = details.responseHeaders[i].value;
                    if (val.indexOf(url) != -1) {
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