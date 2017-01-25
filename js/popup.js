/**
 * Created by oliver on 25.01.17.
 */
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


function getCookieLivetimeSetting(callback, url) {
    chrome.runtime.sendMessage( {getCookieLivetime: {
        url: url
    }}, callback);
}

function setCookieLivetimeSetting(pattern,value) {
    var settings = ["allow","session_only","block"];
    chrome.runtime.sendMessage({setCookieLivetime: {
        value : settings[value],
        pattern : pattern
    }});
}

$(document).ready(function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    },function (tabs) {
        var url = getDomainFromURLString(tabs[0]['url']);
        $("#side_url").text(url);
        getCookieLivetimeSetting(function (response) {
            var cookielivetime = response.cookieLivetime;
            if (cookielivetime !== undefined){
                document.getElementById("cookieLivetime").selectedIndex = cookielivetime;
            }
        },url);
    });
    $("#cookieLivetime").on("change",function (e) {
        var url = $("#side_url").text();
        url = url.indexOf("http") === -1 ? "*://" + url + "/*" : url + "/*";
        setCookieLivetimeSetting(url,this.selectedIndex);
    });
});