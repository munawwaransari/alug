function getLocationPath(){
	return window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
}

function getSiteLocationPath(url){
	return url.substring(0,window.location.href.lastIndexOf("/")+1);
}

function getParamValue(paramName){
	var url = window.location.search.substring(1); //get rid of "?" in querystring
	var qArray = url.split('&'); //get key-value pairs
	for (var i = 0; i < qArray.length; i++) 
	{
		var pArr = qArray[i].split('='); //split key and value
		if (pArr[0] == paramName) 
			return pArr[1]; //return value
	}
}

async function loadJsonData(url,  callback, errorCallback)
{

	try {
		console.log('Fetching: '+ url);
		const response = await fetch(url+"?nocache=123");
		if (!response.ok) {

			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();

		callback(data);
	} 
	catch (error) {

		console.error("Fetch error:", error);
		if (errorCallback){
			errorCallback(error);
		}
	}
}

async function loadHtmlData(url,  callback, opt)
{
	try {
		const response = await fetch(url, opt);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.text();
		callback(data);
	} 
	catch (error) {
		console.error("Fetch error:", error);
	}
}

function showArabicKeyboard(keybd){
	setTimeout(function(){
		console.log("Opening keyboard: " + keybd);
		window.open("keybd.html?layout="+keybd, "name", "top=0,left=0,width=600px,height=266px");
	}, 10);
}

function copyTextToClipboard(txt){
	navigator.clipboard.writeText(txt);
}

const PAD_WIDTH = 768;
const MOBILE_WIDTH = 480;

function getDeviceType() {
	var device_width = window.innerWidth * window.devicePixelRatio;
    var device_height = window.innerHeight * window.devicePixelRatio;

    if (device_width <= MOBILE_WIDTH) {
        return "mobile";
    } else if (device_width <= PAD_WIDTH) {
        return "mobile";
    } else {
        return "desktop";
    }
}

function arRemovePunct(txt){
	var punctuation = "َٰ ّ َ ً ْ ُ ٌ ِ ٍ" ;
	return txt.replace(new RegExp("["+punctuation+"]+","g"), '')
				.replace(new RegExp("ٱ", "g"), 'ا')
				.replace(new RegExp("إ", "g"), 'ا')
				.replace(new RegExp("أ", "g"), 'ا')
				.replace(new RegExp("ى", "g"), 'ي');
}

function replaceWord(w){
	var punctuation = "ۡۧ ـ	 ۦۥۣۤۢۡ۠۟۞۝ۜۛۚۙۘۗۖە";
	var text = w.text
				.replace(new RegExp("["+punctuation+"]+","g"), '')
				.replace(new RegExp("ٱ", "g"), 'ا')
				.replace(new RegExp("ىٰ","g"), 'ى')
				.replace(new RegExp("وَال","g"), 'ال')
				.replace(new RegExp("ٰ","g"), "ا")
				.replace(new RegExp("لِل","g"),"");
	return text;
}

function removePunctuations(w){
	var punctuation = "ۡۧـۦۥۣۤۢۡ۠۟۞۝ۜۛۚۙۘۗۖە";
	var text = w.replace(new RegExp("["+punctuation+"]+","g"), '');
	return text;
}

function changeWord(w, pos, desc, p1, p2)
{
	if (pos == "verb"){
		if(desc.startsWith("past")){
			return "-";
		}
		if(p1 && !w.endsWith(p1))
			w = w.replace(new RegExp("['َُِ']$","g"),'')
				 .replace(new RegExp("$","g"), p1);
		return w;
	}
	if(p2 && !w.endsWith(p2))
		w = w.replace(new RegExp('ًٌٍ', "g"), '')
			 .replace(new RegExp("$","g"), p2);
	return w;
}

function makeRafa(w, pos, desc){
	return changeWord(w, pos, desc, 'ُ', 'ٌ');
}

function makeNasab(w, pos, desc){
	return changeWord(w, pos, desc, 'َ','اً');
}

function makeJar(w, pos, desc){
	return changeWord(w, pos, desc,'ِ','ٍ');
}

function makeJazm(w, pos, desc){
	return changeWord(w, pos, desc,'ْ');
}

/*
function replaceWithLink(verse, word, text){
	var link = encodeURI("https://glosbe.com/ar/"+lang+"/"+text);
	var click_event = (parent ? "parent.window" : "window") + ".open(updateLang(this.href), '_blank'); return false;";
	if( verse.search(word) == -1){
		word = word.replace(new RegExp("ٍ","g"),'')
				   .replace(new RegExp("ً","g"),'')
				   .replace(new RegExp("ٌ","g"),'')
				   .replace(new RegExp("ٞ","g"),'')
				   .replace(new RegExp("ۡ","g"),"ْ")
				   .replace(new RegExp("ۖ","g"),'')
				   .replace(new RegExp("ۗ","g"),'')
				   .replace(new RegExp("ۘ","g"),'')
				   .replace(new RegExp("ۙ","g"),'')
				   .replace(new RegExp("ۚ","g"),'')
				   .replace(new RegExp("ۛ","g"),'')
				   .replace(new RegExp("ۜ","g"),'')
				   .replace(new RegExp("ٖ","g"),'')
				   .replace(new RegExp("اْ", "g"), 'ا۟')
				   .replace(new RegExp("مَٰ","g"),"مَـٰ")
				   .replace(new RegExp("ثَٰ","g"),"ثَـٰ")
				   .replace(new RegExp("بَٰ","g"),"بَـٰ")
				   .replace(new RegExp("كَٰ","g"),"كَـٰ")
				   .replace(new RegExp("لَٰ","g"),"لَـٰ")
				   .replace(new RegExp("قَٰ","g"),"قَـٰ")
				   .replace(new RegExp("يّٞ","g"),"ىٌّ");
	}
	if( verse.search(word) == -1){
		word = word.replace(new RegExp("^كَ","g"),'')
				   .replace(new RegExp("^لِ","g"),'');
	}
	return verse.replace(word, '<a title="click to view in glosbe.com" class="word" style="cursor:pointer;" href="'+link+'" onclick="'+click_event+'">'+word+'</a>');
}
*/