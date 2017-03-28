function dateToRequiredFormat(date) {
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
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

function getThirdpartySetting(callback) {
    chrome.runtime.sendMessage( {getThirdparty:true},callback);
}

function getCookieLivetimeSetting(callback,url) {
    chrome.runtime.sendMessage( {getCookieLivetime: {
        url: url
    }}, callback);
}

function setThirdpartySetting(value) {
    chrome.runtime.sendMessage({setThirdparty:{value:value}});
}

function setCookieLivetimeSetting(pattern,value) {
    var settings = ["allow","session_only","block"];
    chrome.runtime.sendMessage({setCookieLivetime: {
        value : settings[value],
        pattern : pattern
    }});
}

$(document).ready(function () {
    var template_glob;
    $.get("templates/SpecificsidePanelTemplate.mst",function (template) {
        Mustache.parse(template);
        template_glob = template;
    });
    getThirdpartySetting(function (response) {
        var thirdPartyCookieAllowed = response.thirdparty;
        if (thirdPartyCookieAllowed !== undefined){
            console.log(thirdPartyCookieAllowed);
            if (thirdPartyCookieAllowed) {
                $("#thirdPartyGeneral").attr("src", "img/not_checked32.png");
            }
            else {
                $("#thirdPartyGeneral").attr("src", "img/checked32.png");
            }
        }
    });
    getCookieLivetimeSetting(function (response) {
        var cookieLiveTime = response.cookieLivetime;
        if (cookieLiveTime !== undefined){
            document.getElementById('cookieLivetimeGeneral').selectedIndex = cookieLiveTime;
        }
    });
    $("#cookieLivetimeGeneral").on("change",function (e) {
        setCookieLivetimeSetting("<all_urls>",this.selectedIndex);
    });
    $("#thirdPartyGeneral").click(function () {
        var src = $("#thirdPartyGeneral").attr("src");
        if (src.indexOf("not") === -1){
            setThirdpartySetting(true);
            $("#thirdPartyGeneral").attr("src","img/not_checked32.png");
        } else {
            setThirdpartySetting(false);
            $("#thirdPartyGeneral").attr("src","img/checked32.png");
        }
    });
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
        end.setDate(end.getDate()+1);
        chrome.history.search({
            "text": "",
            "startTime": begin.getTime(),
            "endTime": end.getTime()
        },function (results) {
            console.log(results);
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
            var tabofSites = $("#tabofSites").find("> div.panel-body > div.panel-group");
            var requestetAmount = $("#amountOfSites").val();
            tabofSites.find("div").remove();

            for (var j = 0; j < keys.length && j < requestetAmount; j++){
                var rendered = Mustache.render(template_glob,{heading:"<span class='col-md-4'>" + keys[j] + "</span> <span class='col-md-4'><button\
                        class=\"btn btn-primary specbtn\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#specSetting" + j +
                "\" aria-expanded=\"false\" aria-controls=\"specSetting" + j + "\">Einstellungen</button></span>",
                    panelbody:"<div class='panel-collapse collapse' role='tabpanel' id=\"specSetting"+ j +"\">"});
                tabofSites.append(rendered);
            }
            $(".cookieLivetimeSpecific").on("change",function (e) {
                var url = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].childNodes[1].textContent;
                url = url.indexOf("http") === -1 ? "*://" + url + "/*" : url + "/*";
                setCookieLivetimeSetting(url,this.selectedIndex);
            });
            $(".logincookies").click(function (e) {
                var src = $(".logincookies").attr("src");
                var url = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].childNodes[1].textContent;
                var obj = {};
                console.log("Klick");
                console.log(url);
                chrome.storage.sync.get(url,function (items) {
                    if (src.indexOf("not") === -1){
                        obj[url] = false;
                        chrome.storage.sync.set(obj);
                        $(".logincookies").attr("src","img/not_checked32.png");
                    } else {
                        obj[url] = true;
                        chrome.storage.sync.set(obj);
                        $(".logincookies").attr("src","img/checked32.png");
                    }
                });

            });
            $(".specbtn").click(function (e) {
                var domain = e.target.parentNode.parentNode.childNodes[1].textContent;
                chrome.storage.sync.get(domain,function (items) {
                    if (chrome.runtime.lastError){
                        var obj = {};
                        obj[domain] = false;
                        chrome.storage.sync.set(obj);
                        $(".logincookies").attr("src","img/not_checked32.png");
                    } else {
                        if (items[domain]){
                            $(".logincookies").attr("src","img/checked32.png");
                        } else{
                            $(".logincookies").attr("src","img/not_checked32.png");
                        }
                    }
                });
                getCookieLivetimeSetting(function (response) {
                    var selector = ".cookieLivetimeSpecific :nth-child("+ (response.cookieLivetime+1) +")";
                    $(selector).prop('selected',true);
                },domain);
            });
        });
    });
    $("#addManuellSite").click(function () {
        var site = $("#manSiteInput").val();
        var tabofSites = $("#tabofSites").find("> div.panel-body > div.panel-group");
        var amount = $(".cookieLivetimeSpecific").length + 1;
        var rendered = Mustache.render(template_glob,{heading:"<span class='col-md-4'>" + site + "</span> <span class='col-md-4'><button\
                        class=\"btn btn-primary specbtn\" data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#specSetting" + amount +
        "\" aria-expanded=\"false\" aria-controls=\"specSetting" + amount + "\">Einstellungen</button></span>",
            panelbody:"<div class='panel-collapse collapse' role='tabpanel' id=\"specSetting"+ amount +"\">"});
        tabofSites.append(rendered);
        $(".cookieLivetimeSpecific").on("change",function (e) {
            var url = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].childNodes[1].textContent;
            url = url.indexOf("http") === -1 ? "*://" + url + "/*" : url + "/*";
            setCookieLivetimeSetting(url,this.selectedIndex);
        });
        $(".logincookies").click(function (e) {
            var src = $(".logincookies").attr("src");
            var url = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.childNodes[1].childNodes[1].childNodes[1].textContent;
            var obj = {};
            console.log("Klick");
            console.log(url);
            chrome.storage.sync.get(url,function (items) {
                if (src.indexOf("not") === -1){
                    obj[url] = false;
                    chrome.storage.sync.set(obj);
                    $(".logincookies").attr("src","img/not_checked32.png");
                } else {
                    obj[url] = true;
                    chrome.storage.sync.set(obj);
                    $(".logincookies").attr("src","img/checked32.png");
                }
            });

        });
        $(".specbtn").click(function (e) {
            var domain = e.target.parentNode.parentNode.childNodes[1].textContent;
            chrome.storage.sync.get(domain,function (items) {
                if (chrome.runtime.lastError){
                    var obj = {};
                    obj[domain] = false;
                    chrome.storage.sync.set(obj);
                    $(".logincookies").attr("src","img/not_checked32.png");
                } else {
                    if (items[domain]){
                        $(".logincookies").attr("src","img/checked32.png");
                    } else{
                        $(".logincookies").attr("src","img/not_checked32.png");
                    }
                }
            });
            $("#site").text(domain);
            getCookieLivetimeSetting(function (response) {
                var selector = ".cookieLivetimeSpecific :nth-child("+ (response.cookieLivetime+1) +")";
                $(selector).prop('selected',true);
            },domain);
        });
    });
    $("#removeAllCookies").click(function () {
        chrome.browsingData.removeCookies({"since":0},function () {
            console.log("Hallo");
        });
        chrome.notifications.create("removesuccess",{
            type: "basic",
            iconUrl: "img/logo32.png",
            title: "Removed all Cookies",
            message: "Es wurden alle Cookies entfernt",
            priority: 0
        });
    });
    $("#removeSince").click(function () {
        var since = new Date($("#since").val());
        chrome.browsingData.removeCookies({"since":since.getTime()});
        chrome.notifications.create("removesuccess",{
            type: "basic",
            iconUrl: "img/logo32.png",
            title: "Removed Cookies since (" + since.toDateString() + ")",
            message: "Es wurden alle Cookies entfernt, die seit (" + since.toDateString() + ") erstellt wurden.",
            priority: 0
        });
    });
    $("[aria-controls=general]").click(function () {
        getThirdpartySetting(function (response) {
            var thirdPartyCookieAllowed = response.thirdparty;
            if (thirdPartyCookieAllowed !== undefined){
                if (thirdPartyCookieAllowed) {
                    $("#thirdPartyGeneral").attr("src", "img/not_checked32.png");
                }
                else {
                    $("#thirdPartyGeneral").attr("src", "img/checked32.png");
                }
            }
        });
        getCookieLivetimeSetting(function (response) {
            var cookieLiveTime = response.cookieLivetime;
            if (cookieLiveTime !== undefined){
                document.getElementById('cookieLivetimeGeneral').selectedIndex = cookieLiveTime;
            }
        });
    });
});