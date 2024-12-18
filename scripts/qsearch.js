//
//	Author: munawwar_ali@yahoo.com
//

var lang = "ar";
var lastSuggestionInput = undefined;
var qf_list = [];
var q_summary = {};

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
	
	if(parent.playAudio == undefined){
		var e = document.getElementById("qari");
		e.innerHTML = "";
	}
	
	loadQList();
};


/* 
Loads all words of Quran 
*/
async function loadQList(){
	
	var fileUrl = getLocationPath() + "q.dic/qf-list.json";
	loadJsonData(fileUrl, function(data){
		q_summary = {
			"credit": data[0].credit,
			"word_total": data[0].word_total,
			"freq_total": data[0].freq_total,
		};
		qf_list = data.slice(1);
		var q_words = qf_list.map(function(d){
			return d.word;
		});
		
		setTimeout(function(){listWordInfo();}, 50);
		
		//setTimeout(function(){
			autocomplete(document.getElementById('searchText'), function(val, callback){
				var condition = val.length > 1 && val !== lastSuggestionInput;
				if(condition){
					lastSuggestionInput = val;
					//getQSuggesstions(val, callback);
					val = val.trim();
					var suggestionsList = q_words.filter(function(w){
						return arRemovePunct(w).startsWith(val);
					});
					if(callback){
						callback(suggestionsList);	
					}
				}
				return condition;
			});
		//}, 10);
	});			
}

/* 
Search Quran using QuranJS API  
*/
function search(){
	$("#qari").show();
	stopPlayVerse();
	const text = arRemovePunct(document.getElementById("searchText").value);
	var div = $("#searchResult");
	div.empty();
	div.html('Searching '+text+' in the Quran...');
	SearchQuran(window.QuranJS.Search.search, text, function(data){
		console.log(data);
		if(data.results.length == 0){
			div.html('No results found for '+ text);
			return;
		}
		div.html('');
		data.results.forEach(function(res){
			var resulText = res.highlighted ?? res.text;
			if(resulText){
				var verseKeys = res.verseKey.split(":");
				var verse = ""; //resulText;
				var replacedWords = [];
				var wIndex = 0;
				res.words.forEach(function(w){
					wIndex++;
					var url = "https://www.almaany.com/quran/"+verseKeys[0]+"/"+verseKeys[1]+"/"+wIndex;
					verse = verse + '<p class="word" style="cursor:pointer" onclick="showWordAnalysis(\''+url+'\');">'+				 
									   w.text + '&nbsp;'+
									'</p>';
					replacedWords.push({"word": w.text, "text": replaceWord(w) });
				});
				
				var spanId = verseKeys[0]+"_"+verseKeys[1]; //res.verseKey.replace(":","_");
				var play = parent.playAudio ? '<span id="'+spanId+'">'+
											  
											  '<img title="Qirat" src="images/speech-enabled.png" style="visibility:visible;width:20px;cursor: pointer;" '+
										      'onclick="playVerse(\''+getQiratPlayUrl(res.verseKey)+'\',\''+res.verseKey+'\')"/>'+
											  
											  '<img title="Stop" src="images/stop.png" style="visibility:hidden;width:20px;cursor: pointer;" '+
										      'onclick="stopPlayVerse()"/>'+
											  '</span>': '';
										
				var copy = 	'<span>'+			  
								'<img id="copyIcon" src="images/copy.jpg" style="visibility:visible;width:20px;cursor: pointer;" '+
								'onclick="copyTextToClipboard(\''+resulText+'\');alert(\'Copied!\');"/>'+
							'</span>';
											  
				var tanzilLink = '<a title="Click to view in tanzil.com" style="font-size:18px" href="https://tanzil.net/#'+res.verseKey+'" '+
							     'onclick="var w = parent.window ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+
								 '[' + res.verseKey+ ']'+
								 '</a>';
								 
				var translationLink = '<a title="Click to view translation in tanzil.com" style="font-size:10px" href="https://tanzil.net/#trans/en.sahih/'+res.verseKey+'" '+
							     'onclick="var w = parent.window ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+
								 '[Trasnlatation (en)]'+
								 '</a>';
								 
				div.append($('<div class="verse">'+verse+' '+tanzilLink+' '+copy+play+' <span>'+translationLink+'</span></div>'));
			}
		});
	});
}

/*
Load word analysis from almaany.com/quran
*/
function showWordAnalysis(url){
	if(parent.getLang){
		parent.window.open(url, '_blank');
	}else{
		window.open(url, '_blank');
	}
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

/*
Loads all words from the Quran
*/
function listWordInfo(filter){
	$("#qari").hide();
	if(qf_list && qf_list.length > 0){
		var div = $("#searchResult");
		div.empty();
		var credit = '<div class="credit">source: <a href="#" onclick="window.open(\''+q_summary.credit+'\', \'_blank\')">'+q_summary.credit+'</a><div>';
		var table = '<table class="wordIndex"><th>Frequency</th><th>PoS</th><th>Word</th>';
		qf_list.forEach(function(data) {
			//var w_link = data.wsearch ? "https://www.almaany.com/quran/"+data.wsearch : "";
			var alink = '<p style="cursor:pointer;" onclick="selectWordAndSearchInQuran(\''+data.word+'\')">';
				/*
				alink += w_link ? 
						('<a title="Analyze" href="#" style="margin-right:4px;font-size:14px;cursor:pointer;" '+
							'onclick="var w = parent.window ? parent.window : window; '+
								'w.open(\''+w_link+'\', \'_blank\'); return false;">'+
						'(تحليل)'+
						'</a>') : '';
				*/
				alink += data.word+'</p>';
				
			if(filter){
				if(arRemovePunct(data.word).startsWith(arRemovePunct(filter))){
					//table = table+ '<tr>'+'<td>'+data.per.toFixed(2)+'</td>'+'<td>'+data.frequency+'</td>'+'<td>'+data.pos+'</td>'+'<td class="qword">'+alink+'</td>'+'</tr>';	
					table = table+ '<tr>'+'<td>'+data.frequency+'</td>'+'<td>'+data.pos+'</td>'+'<td class="qword">'+alink+'</td>'+'</tr>';	
				}
			}else{
				table = table+ '<tr>'+'<td>'+data.frequency+'</td>'+'<td>'+data.pos+'</td>'+'<td class="qword">'+alink+'</td>'+'</tr>';					
			}
		});
		table = table+'</table>';
		div.append($(credit+table));
	}
}

function filterWords(){
	$("#qari").hide();
	var text = $("#searchText").val();
	listWordInfo(text);
}

function selectWordAndSearchInQuran(word){
	$('#searchText').val(arRemovePunct(word));
	search();
}

/*
Loads Quran surah index
*/
function listSurahs(){
	$("#qari").hide();
	var path = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
	var url = path + 'data/qsurah.json';
	listSurahsAsync(url, function(data){
		
		var div = $("#searchResult");
		div.empty();
		var table = '<table class="surahIndex"><th>Index</th><th>Surah Name (en)</th><th>Surah Name (ar)</th>';
		for (const [index, surah] of Object.entries(data)) {
			
			var tanzilLink = '<a style="cursor:pointer;font-size:18px" href="https://tanzil.net/#'+index+'" '+
				 'onclick="var w = parent ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+
				 '[' + surah.en+ ']'+
				 '</a>';
			table = table+ '<tr>'+'<td>'+index+'</td>'+'<td>'+tanzilLink+'</td>'+'<td class="qword">'+surah.ar+'</td></tr>';	
		}
		table = table+'</table>';
		div.append($(table));
	});
}

async function listSurahsAsync(url, callback)
{
	try {
		const response = await fetch(url);
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
};

/*
 Redirects to Hadith list at sunnah.com
*/
function searchHadith(){
	
	const text = document.getElementById("searchText").value;
	var searchUrl = encodeURI("https://sunnah.com/search?q="+text);
	var w = parent.window ? parent.window : windwo;
	w.open(searchUrl, '_blank');
}


/*
 Loads and plays mp3 from everyayah.com
*/
function getQiratPlayUrl(verseKey){
	var chapter = verseKey.split(":")[0];
	if(chapter.length === 1) chapter = "00" + chapter;
	if(chapter.length === 2) chapter = "0" + chapter;
	
	var ayat = verseKey.split(":")[1];
	if(ayat.length === 1) ayat = "00" + ayat;
	if(ayat.length === 2) ayat = "0" + ayat;
		
	return encodeURI("https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/"+chapter+ayat+".mp3");
}

function togglePlayButtons(verseKey, v, h){
	var id = verseKey.replace(":","_");
	var elem = document.getElementById(id);
	elem.children[0].style = "visibility:"+v+";width:20px;cursor: pointer;"
	elem.children[1].style = "visibility:"+h+";width:20px;cursor: pointer;";
}

function updateLang(url){
	lang = parent.getLang ? parent.getLang() : lang;
	var current_url = decodeURI(url);
	var current_lang = current_url.replace("https://glosbe.com/ar/",'').split("/");
	return encodeURI("https://glosbe.com/ar/"+lang+"/"+current_lang[1]);
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
	if(parent && parent.stopAudio){
		parent.stopAudio();
	}
}