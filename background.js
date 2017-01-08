chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request);
        if (request.getThirdparty){
            chrome.privacy.websites.thirdPartyCookiesAllowed.get({},function (details) {
                sendResponse({thirdparty : details.value});
            });
            return true;
        }
        if (request.getCookieLivetime){
            chrome.contentSettings.cookies.get({
                "primaryUrl": "http://*.*"
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

chrome.cookies.onChanged.addListener(function (changeInfo) {
    console.log(changeInfo);
});