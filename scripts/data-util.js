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
}

function isOS(os){
	return navigator.userAgent.includes(os+";") || 
	navigator.userAgent.includes(os);
}