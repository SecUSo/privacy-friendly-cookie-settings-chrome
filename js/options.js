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
    if (url.indexOf("://") > -1){
        domain = url.split("/")[2];
    } else {
        domain = url.split("/")[0];
    }
    domain = domain.split(":")[0];
    return domain;
}

$(document).ready(function () {
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
});