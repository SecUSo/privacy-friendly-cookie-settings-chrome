function dateToRequiredFormat(date) {
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDay()+1;
    if (month < 10){
        month = '0' + month;
    }
    if (day < 10){
        day = '0' + day;
    }
    return year + '-' + month + '-' + day;
}

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

var thirdPartyCookieAllowed;
var cookieLiveTime;

chrome.contentSettings.cookies.get({
    "primaryUrl": "http://google.*"
},function (details) {
    var val = details.setting;
    if (val === "allow"){
        cookieLiveTime = 0;
    } else if (val === "session_only"){
        cookieLiveTime = 1;
    } else {
        cookieLiveTime = 2;
    }
});
chrome.privacy.websites.thirdPartyCookiesAllowed.get({},function (details) {
    thirdPartyCookieAllowed = details.value;
});

$(document).ready(function () {
    if (thirdPartyCookieAllowed){
        $("#thirdPartyGeneral").attr("src","img/checked.png");
    }
    if (cookieLiveTime !== undefined){
        document.getElementById('cookieLivetimeGeneral').selectedIndex = cookieLiveTime;
    }
    var historybtn = document.getElementById("historybtn");
    var startofyear = new Date();
    startofyear.setMonth(0,1);
    $("#settings").hide();
    var now = new Date();
    $(".begin").val(dateToRequiredFormat(startofyear));
    $(".end").val(dateToRequiredFormat(now));
    historybtn.addEventListener("click",function () {
        var begin = new Date($("#beginSpec").val());
        var end = new Date($("#endSpec").val());
        chrome.history.search({
            "text": "",
            "startTime": begin.getTime(),
            "endTime": end.getTime()
        },function (results) {
            var modHistory = {};
            for (var i = 0; i < results.length; i++){
                var historyItem = results[i];
                var key = getDomainFromURLString(historyItem.url);
                if (modHistory.hasOwnProperty(key)){
                    modHistory[key]++;
                } else {
                    modHistory[key] = 1;
                }
            }
            var keys = Object.keys(modHistory);
            keys.sort(function (a, b) {
                return modHistory[b] - modHistory[a];
            });
            var tabofSites = $("#tabofSites").find("> tbody");
            var requestetAmount = $("#amountOfSites").val();
            tabofSites.find("tr").remove();
            for (var j = 0; j < keys.length && j < requestetAmount; j++){
                tabofSites.append("<tr><td>" + keys[j] + "</td> <td><button class=\"btn btn-primary specbtn\">Einstellungen</button></td></tr>")
            }
            $(".specbtn").click(function (e) {
                var domain = e.target.parentNode.parentNode.firstChild.textContent;
                $("#site").text(domain);
                $("#settings").show();
            });
        });
    });
    $("#removeAllCookies").click(function () {
        chrome.browsingData.removeCookies({"since":0});
    });
    $("#removeSince").click(function () {
        var since = new Date($("#since").val());
        chrome.browsingData.removeCookies({"since":since.getTime()});
    });
});