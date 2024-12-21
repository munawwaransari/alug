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

async function loadJsonData(url, callback, errorCallback)
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

function filterTableRows(table, column, txt, allText){
	
	if(txt === allText){
		$(table + " tr td").show();
		$(table + " tr th:nth-child("+column+")").show();
		return;
	}
	$(table + " tr td").hide();
	$(table + " tr td:nth-child("+column+")").filter((i, td) => {
		if($(td).text().startsWith(txt) === false){
			$(td).parent().children().hide();
		}else{
			$(td).parent().children().show();
		}
	});
	$(table + " tr td:nth-child("+column+")").hide();
	$(table + " tr th:nth-child("+column+")").hide();
}

function isOS(os){
	return navigator.userAgent.includes(os+";") || 
	navigator.userAgent.includes(os);
}

function replaceQLink(val, addBreak=true){
	var qlinkExp = /(\[(\d+)\:(\d+)\])/g;
	ex = val;
	if(ex.match(qlinkExp)){
		ex = ex.replace(qlinkExp, '<a href="#" onclick="var w=parent?parent.window:window;w.open(\'https://tanzil.net/#$2:$3\',\'_blank\');">$1</a>');
		return '<span style="font-size:18px;">'+(addBreak ? '<br/>':'')+ex+'</span>';
	}
	return '<span style="font-size:18px;">'+val+'</span>';
}

//https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
function invertColor(hex) {
	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}
	// convert 3-digit hex to 6-digits.
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	if (hex.length !== 6) {
		throw new Error('Invalid HEX color.');
	}
	// invert color components
	var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
		g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
		b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
	// pad each with zeros and return
	return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
	len = len || 2;
	var zeros = new Array(len).join('0');
	return (zeros + str).slice(-len);
}

function removeTimePrefix(txt){
	if(txt[0] === 'و')
		return txt.substring(2);
	return txt;
}