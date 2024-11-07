//
//	Author: munawwar_ali@yahoo.com
//

function showArabicKeyboard(keybd){
	setTimeout(function(){
		console.log("Opening keyboard: " + keybd);
		window.open("keybd.html?layout="+keybd, "name", "top=0,left=0,width=600px,height=266px");
	}, 10);
}

function search(){
	const text = document.getElementById("searchText").value;
	var div = $("#searchResult");
	div.empty();
	SearchQuran(window.QuranJS.Search.search, text, function(data){
		console.log(data);
		data.results.forEach(function(res){
			if(res.highlighted){
				var verse = res.highlighted;
				var replacedWords = [];
				res.words.forEach(function(w){
					replacedWords.push({"word": w.text, "text": replaceWord(w) });
				});
				replacedWords.forEach(function(w){
					verse = replaceWithLink(verse, w.word, w.text);
				});
				
				var spanId = res.verseKey.replace(":","_");
				var play = parent.playAudio ? '<span id="'+spanId+'">'+
											  
											  '<img title="Play" src="images/speech-enabled.png" style="visibility:visible;width:20px;cursor: pointer;" '+
										      'onclick="playVerse(\''+getQiratPlayUrl(res.verseKey)+'\',\''+res.verseKey+'\')"/>'+
											  
											  '<img title="Stop" src="images/stop.png" style="visibility:hidden;width:20px;cursor: pointer;" '+
										      'onclick="stopPlayVerse()"/>'+
											  
											  '</span>': '';
				div.append($('<div>'+verse+' ['+ res.verseKey +'] '+play+'</div>'));
			}
		});
	});
}

function getQiratPlayUrl(verseKey){
	var chapter = verseKey.split(":")[0];
	if(chapter.length === 1) chapter = "00" + chapter;
	if(chapter.length === 2) chapter = "0" + chapter;
	
	var ayat = verseKey.split(":")[1];
	if(ayat.length === 1) ayat = "00" + ayat;
	if(ayat.length === 2) ayat = "0" + ayat;
		
	return encodeURI("https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/"+chapter+ayat+".mp3");
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

function replaceWithLink(verse, word, text){
	var link = encodeURI("https://glosbe.com/ar/"+lang+"/"+text);
	var click_event = (parent ? "parent.window" : "window") + ".open(this.href, '_blank'); return false;";
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
	return verse.replace(word, '<a class="word" style="cursor:pointer;" href="'+link+'" onclick="'+click_event+'">'+word+'</a>');
}

function searchVerse(verseKey){
	SearchQuran(window.QuranJS.Verses.findByKey, verseKey, function(data){
		console.log(data);
	});
}

function SearchQuran(ctx, text, callback){
	
	const response = ctx(text,  { language: window.QuranJS.Language.ENGLISH, size: 10 })
					.then((data)=>{								   
						if(callback)
							callback(data);
					},
					(error) => {
						console.error("Quran search error:", error);
						if(callback)
							callback(null, error);
					});
};

function getParamValue(paramName)
{
	var url = window.location.search.substring(1); //get rid of "?" in querystring
	var qArray = url.split('&'); //get key-value pairs
	for (var i = 0; i < qArray.length; i++) 
	{
		var pArr = qArray[i].split('='); //split key and value
		if (pArr[0] == paramName) 
			return pArr[1]; //return value
	}
}

function togglePlayButtons(verseKey, v, h){
	var id = verseKey.replace(":","_");
	var elem = document.getElementById(id);
	elem.children[0].style = "visibility:"+v+";width:20px;cursor: pointer;"
	elem.children[1].style = "visibility:"+h+";width:20px;cursor: pointer;";
}

function playVerse(url, verseKey){
	
	// Update Qari
	var selected_qari = document.getElementById('qari-options').value;
	var current_url = decodeURI(url);
	var current_qari = current_url.replace("https://everyayah.com/data/",'')
								  .split("/")[0];
	var url2  = encodeURI(current_url.replace(current_qari, selected_qari));

	if(parent){
		parent.playAudio(url2, function(action){
			
			if(action == "pause" || action == "ended"){
				togglePlayButtons(verseKey, "visisble", "hidden");
			}
		});
		
		togglePlayButtons(verseKey, "hidden", "visisble");
	}
}

function stopPlayVerse(){
	if(parent){
		parent.stopAudio();
	}
}

var lang = "ar";
window.onload = function(){
	var langParam = decodeURI(getParamValue("lang"));
	if(langParam && langParam != 'undefined' && ( langParam ==='ar' || langParam ==='ur' || langParam ==='en') ){
		lang = langParam;
	}
	
	var searchVal = decodeURI(getParamValue("search"));	
	if(searchVal && searchVal != 'undefined'){
		$("#searchText").val(searchVal);
		search();
	}	
};
