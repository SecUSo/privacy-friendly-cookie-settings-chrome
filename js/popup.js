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
	
	addText();
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
    chrome.storage.sync.get(null,function (items) {
        var url = $("#side_url").text();
        if (items[url]){
            $("#logincookies").attr("src","img/checked32.png");
        }
        else {
            $("#logincookies").attr("src","img/not_checked32.png");
        }
        if (items["thirdparty"]){
            if (items["thirdparty"][url]) {
                $("#thirdparty").attr("src", "img/checked32.png");
            }
            else if (items["thirdparty"][url] === false){ // items["thirdparty"][url] could be undefined
                $("#thirdparty").attr("src", "img/not_checked32.png");
            }
            else {
                if (items["thirdparty"]["default"]){
                    $("#thirdparty").attr("src", "img/checked32.png");
                } else {
                    $("#thirdparty").attr("src", "img/not_checked32.png");
                }
            }
        }
        else if (items["thirdparty"] && items["thirdparty"]["defualt"]){
            $("#thirdparty").attr("src","img/checked32.png");
        }
    });
    $("#logincookies").click(function () {
        var src = $("#logincookies").attr("src");
        var url = $("#side_url").text();
        var obj = {};
        chrome.storage.sync.get("logincookies",function (items) {
            if (src.indexOf("not") === -1){
                items.logincookies[url]["setting"] = false;
                chrome.storage.sync.set(obj);
                $("#logincookies").attr("src","img/not_checked32.png");
            } else {
                items.logincookies[url]["setting"] = true;
                chrome.storage.sync.set(obj);
                $("#logincookies").attr("src","img/checked32.png");
            }
        });
    });
    $("#thirdparty").click(function () {
        var url = $("#side_url").text();
        chrome.storage.sync.get("thirdparty",function (items) {
            var settings = false;
            if (!items.hasOwnProperty("thirdparty")){
                items = {thirdparty : {}};
            } else {
                settings = items["thirdparty"][url] || false;
            }
            if (settings){
                items["thirdparty"][url] = false;
                $("#thirdparty").attr("src","img/not_checked32.png");
            }
            else {
                items["thirdparty"][url] = true;
                $("#thirdparty").attr("src","img/checked32.png");
            }
            chrome.storage.sync.set(items);
            chrome.runtime.sendMessage({updateSettings: true});
        });
    });
});

function addText(){
	$("#conTitle1").html(chrome.i18n.getMessage("conTitle"));
	$("#proTitle1").html(chrome.i18n.getMessage("proTitle"));
	$("#conTitle2").html(chrome.i18n.getMessage("conTitle"));
	$("#proTitle2").html(chrome.i18n.getMessage("proTitle"));
	$("#conTitle3").html(chrome.i18n.getMessage("conTitle"));
	$("#proTitle3").html(chrome.i18n.getMessage("proTitle"));
	$("#pro_livetime").html(chrome.i18n.getMessage("AdvantagesLivetimeGeneral"));
	$("#con_livetime").html(chrome.i18n.getMessage("DisadvantagesLivetimeGeneral"));
	$("#pro_login").html(chrome.i18n.getMessage("AdvantagesLoginCookies"));
	$("#con_login").html(chrome.i18n.getMessage("DisadvantagesLoginCookies"));
	$("#saveCookiesTitle").html(chrome.i18n.getMessage("storeCookiesTitle"));
	$("#pro_thirdparty").html(chrome.i18n.getMessage("proThirdparty"));
	$("#con_thirdparty").html(chrome.i18n.getMessage("conThirdparty"));
	$("#websiteBlockThirdparty").html(chrome.i18n.getMessage("websiteBlockThirdparty"));
	$("#LoginCookiesChange").html(chrome.i18n.getMessage("loginCookies"));
	$("#openSettings").html(chrome.i18n.getMessage("openSettings"));
	$("#cookieLivetime").html(chrome.i18n.getMessage("cookieLivetimeOptions"));
		
};