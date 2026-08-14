//
//	Author: munawwar_ali@yahoo.com
//

var langOption = 'en-US';
var autoplay = true;
var menuOption = false;
var speech_synthesis_supportd = false;
var autoplay_cache = [];
var states = {};
var arSupported = false, urSupported = false;
var qPlayerObj;
var audio_last_time;
var audio_last_duration;
var app_mode = 'default';
var app_theme = 'default';
var app_bg = 'default';
var app_bg_color = 'default';
window.dashboard = {
    count: 0,
    cards: {}
};
window.topics = alug_chapters;
window.updateStates = function (s) { $.extend(states, s); };

window.isLangSupported = function (lang) {
    return lang === "en-US" ||
        lang === "ar-SA" ||
        lang === "ur-PK" ||
        lang === "ur-IN" ||
        lang === "hi-IN";
}

window.isAutoPlayEnabled = function () {
    return autoplay;
}

window.getLang = function () {
    return document.getElementById('lang-options').value.split("-")[0];
}

window.getLangOption = function () {
    return document.getElementById('lang-options').value;
}

window.openInline = function (url, playOptions) {
    console.log("openInline");
    var flag = autoplay;
    var po = playOptions;
    $('.reading-pane').attr("src", "");
    setTimeout(function () {
        $('.reading-pane').attr('src', url);

        if (po) {
            autoplayAudio(po.topic, po.page);
        }

    }, 5);
}

window.playTextAll = function (txt, lang) {
    setPlayLang(lang, true);
    stopAudio();
    var txtLog = txt ? (txt.length > 20 ? txt.substring(0, 20) : txt) : '';
    console.log(`playing (${lang})... ${txtLog} ...`);
    $("#text").text(txt);
    $("#play").click();
}

window.playText = function (txt, lang, options) {
    if (!autoplay) return;
    if (lang) {
        if (!window.isLangSupported(lang) && options && options["en-US"]) {
            lang = "en-US";
            txt = options["en-US"];
        }
        console.log("current lang:" + $("#languages").val());
        setPlayLang(lang);
    }
    if (txt != undefined) {
        console.log(`playing (${$("#languages").val()})... ${txt.substring(0, 20)} ...`);
        stopAudio();
        $("#text").text(txt);
        $("#play").click();
    }
}

var audio = undefined;
window.stopAudio = function () {
    $("#text").text('\u200B');
    $("#play").click();
    if (audio) {

        audio.pause();
        audio.currentTime = 0;
    }
}

window.pauseAudio = function () {
    if (audio) {

        audio_last_time = audio.currentTime;
        audio.pause();
        audio.currentTime = 0;
    }
}

window.resumeAudio = function () {
    if (audio) {
        audio.currentTime = audio_last_time ? audio_last_time : 0;
        audio.play();
        //audio.resume();
    }
}

window.changeAudioTime = function (ff, value) {
    if (audio) {
        if (value === undefined) {
            var ct = Math.round(audio.duration * 0.01);
            if (ct < 5) ct = 5;
            audio.currentTime += ct * (ff ? +1 : -1);
        } else {
            audio.currentTime = value;
        }
        audio_last_time = audio.currentTime;
    }
}

var updatePlayInterval;
function handlePlayInterval(flag, cb) {
    if (!flag && updatePlayInterval) {
        clearInterval(updatePlayInterval);
    } else if (cb && audio) {
        updatePlayInterval = setInterval(function () {
            cb("progress", { ct: audio.currentTime, duration: audio.duration });
        }, 1000);
    }
}

window.playAudio = function (mpegUrl, cb) {

    stopAudio();
    if (audio) {
        delete audio;
        audio = undefined;
        handlePlayInterval(false);
    }

    audio = new Audio(mpegUrl);

    audio.addEventListener("loadstart", () => {
        if (cb) cb("loadstart", { ct: audio.currentTime });
    });
    audio.addEventListener("loadeddata", () => {
        if (cb) {
            cb("loadeddata", { ct: audio.currentTime, duration: audio.duration });
            handlePlayInterval(true, cb);
        }
    });
    audio.addEventListener("pause", () => {
        if (cb) cb("pause");
    });
    audio.addEventListener("ended", () => {
        audio_last_duration = undefined;
        if (cb) cb("ended");
        handlePlayInterval(false);
    });

    var promise = audio.play();
    if (promise !== undefined) {
        promise.then(_ => {
            console.log("Autoplay started!");
        }).catch(error => {
            console.log("Autoplay was prevented.");
        });
    }
}

window.redirect = function (url, action, data) {
    $('.reading-pane').attr("src", "");
    setTimeout(function () {
        $('.reading-pane').attr('src', encodeURI(getLocationPath() + url + "?action=" + action + "&data=" + data));
    }, 5);
}

window.getAllVoices = function () {
    return $('#languages option');
}

function setPlayLang(lang, force) {
    var currLang = $("#lang-options").val();
    var voiceIndex = force ?
        (states[lang] ? states[lang].dataIndex : undefined) :
        (states[currLang] ? states[currLang].dataIndex : undefined);
    if (voiceIndex != undefined) {
        $("#languages").prop("selectedIndex", parseInt(voiceIndex));
        return true;
    }
}