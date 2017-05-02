/**
 * Created by oliver on 08.02.17.
 */
var question = 1;
var maxQuestions = 9;

function nextQuestion(jumpTo) {
    var id = "#q"+question;
    $(id).hide();
    question = jumpTo || question+1;
    id = "#q"+question;
    $(id).show();
}

$(document).ready(function () {
    for (var i = 2; i <= maxQuestions; i++){
        var id = "#q"+i;
        $(id).hide();
    }

    $("#q1yes").click(function () {
        nextQuestion();
    });
    $("#q1no").click(function () {
        nextQuestion(8);
        setThirdpartySetting(false);
        setCookieLivetimeSetting("<all_urls>",2);
    });

    $("#q2always").click(function () {
        nextQuestion();
        setCookieLivetimeSetting("<all_urls>",0);
    });
    $("#q2untilclose").click(function () {
        nextQuestion();
        setCookieLivetimeSetting("<all_urls>",1);
    });

    $("#q3yes").click(function () {
        nextQuestion();
        setThirdpartySetting(true);
    });
    $("#q3no").click(function () {
        nextQuestion();
        setThirdpartySetting(false);
    });

    $("#q4yes").click(function () {
        nextQuestion();
    });
    $("#q4no").click(function () {
        nextQuestion(8);
    });

    var searchHistory = false;
    $("#q5yes").click(function () {
        nextQuestion();
        searchHistory = true;
    });
    $("#q5no").click(function () {
        nextQuestion(9);
        searchHistory = false;
    });

    var timeperiod = new Date();
    $("#q6oneweek").click(function () {
        nextQuestion();
        timeperiod = new Date();
        timeperiod.setDate(timeperiod.getDate()-7);
    });
    $("#q6twoweek").click(function () {
        nextQuestion();
        timeperiod = new Date();
        timeperiod.setDate(timeperiod.getDate()-14);
    });
    $("#q6onemonth").click(function () {
        nextQuestion();
        timeperiod = new Date();
        timeperiod.setMonth(timeperiod.getMonth()-1);
    });
    $("#q6selfdefined").click(function () {
        nextQuestion();
        timeperiod = new Date($("#q6selfdefinedvalue").val());
    });

    var sitestodisplay = 10;
    $("#q7five").click(function () {
        nextQuestion();
        sitestodisplay = 5;
        if (searchHistory) {
            $("#amountOfSites").val(sitestodisplay);
            $("#beginSpec").val(dateToRequiredFormat(timeperiod));
            $("#endSpec").val(dateToRequiredFormat(new Date()));
            $("#historybtn").click();
        }
    });
    $("#q7ten").click(function () {
        nextQuestion();
        sitestodisplay = 10;
        if (searchHistory) {
            $("#amountOfSites").val(sitestodisplay);
            $("#beginSpec").val(dateToRequiredFormat(timeperiod));
            $("#endSpec").val(dateToRequiredFormat(new Date()));
            $("#historybtn").click();
        }
    });
    $("#q7fifteen").click(function () {
        nextQuestion();
        sitestodisplay = 15;
        if (searchHistory) {
            $("#amountOfSites").val(sitestodisplay);
            $("#beginSpec").val(dateToRequiredFormat(timeperiod));
            $("#endSpec").val(dateToRequiredFormat(new Date()));
            $("#historybtn").click();
        }
    });
    $("#q7twenty").click(function () {
        nextQuestion();
        sitestodisplay = 20;
        if (searchHistory) {
            $("#amountOfSites").val(sitestodisplay);
            $("#beginSpec").val(dateToRequiredFormat(timeperiod));
            $("#endSpec").val(dateToRequiredFormat(new Date()));
            $("#historybtn").click();
        }
    });
    $("#q7selfdefined").click(function () {
        nextQuestion();
        sitestodisplay = $("#q7selfdefinedvalue").val();
        if (searchHistory) {
            $("#amountOfSites").val(sitestodisplay);
            $("#beginSpec").val(dateToRequiredFormat(timeperiod));
            $("#endSpec").val(dateToRequiredFormat(new Date()));
            $("#historybtn").click();
        }
    });

    $("#q8restart").click(function () {
        searchHistory = false;
        timeperiod = new Date;
        sitestodisplay = 10;
        $("#q8").hide();
        nextQuestion(1);
    });

    $("#q9restart").click(function () {
        searchHistory = false;
        timeperiod = new Date();
        sitestodisplay = 10;
        nextQuestion(1);
    })
});