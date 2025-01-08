//
//	Author: munawwar_ali@yahoo.com
//

var lang = "ar";
var lastSuggestionInput = undefined;
var qf_list = [];
var q_summary = {};
var loadStatus;

window.onload = function(){
	
	window.addEventListener("contextmenu", e =>
	{
	  e.preventDefault();
	  //console.log("selected text:", window.getSelection().toString());
	});

	var langParam = decodeURI(getParamValue("lang"));
	if(langParam && langParam != 'undefined' && ( langParam ==='ar' || langParam ==='ur' || langParam ==='en') ){
		lang = langParam;
	}
	
	var searchVal = decodeURI(getParamValue("search"));	
	if(searchVal && searchVal != 'undefined'){
		if(searchVal === 'surahs'){
			listSurahs();
			loadStatus = "surahs";
		}
		else if(searchVal === 'words'){
			loadStatus = "words";
		}
		else{
			$("#searchText").val(searchVal);
			search();
			loadStatus = "search";
		}
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
var all_q_words = undefined;
async function loadQList(){
	
	if(all_q_words == undefined){
		var fileUrl = getLocationPath() + "data/qrn/qf-list.json";
		loadJsonData(fileUrl, function(data){
			all_q_words = data;
			loadWordsFrom(data);
		});		
	}else{
		loadWordsFrom(all_q_words);
	}
}

function loadWordsFrom(data){
	q_summary = {
		"credit": data[0].credit,
		"word_total": data[0].word_total,
		"freq_total": data[0].freq_total,
	};
	qf_list = data.slice(1);
	var q_words = qf_list.map(function(d){
		return d.word;
	});
	
	setTimeout(function(){
		if(loadStatus === "words"){
			loadWordPending = false;
			$("#searchText").val('');
			filterWords();
		}
		else if (!loadStatus){
			listSurahs();
		}
	}, 50);
	
	autocomplete(document.getElementById('searchText'), function(val, callback){
		var condition = val.length > 0 && val !== lastSuggestionInput;
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
}

/* 
Search Quran using QuranJS API  
*/
function search(pageNumber){
	$("#qari").show();
	stopPlayVerse();
	const text = arRemovePunct(document.getElementById("searchText").value);
	var div = $("#searchResult");
	div.empty();
	
	var ctx = window.QuranJS.Search.search;
	var opt = { language: window.QuranJS.Language.ENGLISH, size: 10 };
	if(pageNumber)
		opt.page = pageNumber;
	// check if verse key
	if(text.trim().match(/^\d{1,3}\:\d{1,3}$/g)){
		ctx = window.QuranJS.Verses.findByKey;
		opt = { words: 1};
	}
	
	div.html('Searching '+text+' in the Quran...');
	SearchQuran(ctx, opt, text, function(data){
		console.log(data);
		
		if(!data){
			div.html('No results found for '+ text);
			return;
		}
		
		if(data.results == undefined && data.words){
			var ayah = "";
			var ayahText = data.words.reduce(function(a, x){
				if(x.position > 2) 
					ayah+= " ";
				else
					ayah+= a.translation.text + " ";
				ayah += x.translation.text;
				return ayah;
			});
			div.html('');
			displayVerse(div, ayahText, text, false);
			return;
		}
		
		if(data.results.length == 0){
			div.html('No results found for '+ text);
			return;
		}
		
		div.html('');
		
		// Add search navigation
		var nav = '<div style="font-size:12px;margin-bottom:10px;padding:10px;background-color:#9DBF6C;">'+
				  (data.currentPage > 1 ? 
					'<span onclick="search('+(data.currentPage-1)+')" style="cursor:pointer;margin-right:20px;"><b>Prev</b></span>' 
					: '') +
				  '<span>'+ data.currentPage +' of ' + data.totalPages+ '<span>'+
				  (data.currentPage < data.totalPages ? 
					'<span onclick="search('+(data.currentPage+1)+')" style="cursor:pointer;margin-left:20px;"><b>Next</b></span>' 
					: '') +
				  '</div>';
		div.append($(nav));
		
		data.results.forEach(function(res){
			var resulText = res.highlighted ?? res.text;
			if(resulText){
				//var verseKeys = res.verseKey.split(":");
				var verse = resulText.replace(/[<>\/a-zA-Z]+/ig, '');
				displayVerse(div, verse, res.verseKey);
			}
		});
	});
}

function displayVerse(div, verse, verseKey, analysis=true){
	var verseKeys = verseKey.split(":");
	var spanId = verseKeys[0]+"_"+verseKeys[1]; //res.verseKey.replace(":","_");
	var play = parent.playAudio ? '<span id="'+spanId+'">'+
								  
								  '<img title="Qirat" src="images/speech-enabled.png" style="visibility:visible;width:20px;cursor: pointer;" '+
								  'onclick="playVerse(\''+getQiratPlayUrl(verseKey)+'\',\''+verseKey+'\')"/>'+
								  
								  '<img title="Stop" src="images/stop.png" style="visibility:hidden;width:20px;cursor: pointer;" '+
								  'onclick="stopPlayVerse()"/>'+
								  '</span>': '';

	var copy = "";
	if(analysis)
		copy = '<span>'+			  
					'<img id="analyzeIcon" src="images/analyze.jpg" style="width:20px;cursor: pointer;" '+
					'onclick="analyzeSelection(\''+verse+'\','+verseKeys[0]+','+verseKeys[1]+')"/>'+
					
					'<img id="copyIcon" src="images/copy.jpg" style="margin-left:10px;visibility:visible;width:20px;cursor: pointer;" '+
					'onclick="copyTextToClipboard(\''+verse.replace(/[<>\/a-zA-Z]+/ig, '')+'\');"/>'+
				'</span>';
								  
	var tanzilLink = '<a title="Click to view in tanzil.com" style="font-size:18px" href="https://tanzil.net/#'+verseKey+'" '+
					 'onclick="var w = parent.window ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+
					 '[' + verseKey+ ']'+
					 '</a>';
					 
	var translationLink = '<a title="Click to view translation in tanzil.com" style="font-size:10px" href="https://tanzil.net/#trans/en.sahih/'+verseKey+'" '+
					 'onclick="var w = parent.window ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+
					 '[en]'+
					 '</a>';
					 
	div.append($('<div>'+verse+'</div>'+
				  '<div style="font-size:12px;"><span>'+tanzilLink+'</span>'+
					   '<span style="padding:8px;">'+copy+'</span>'+
					   '<span style="padding:8px;">'+play+'</span>'+
					   '<span style="padding:8px;">'+translationLink+'</span>'+
				 '</div>'));
}

function analyzeSelection(text, surah, verse){
	let selection = window.getSelection();
	let selectedText = selection.toString().trim();
	if (selectedText) {
		var txt = removePunctuations(text.trim());
		if(txt){
			var prevVal = null;
			var words = txt.split(' ')
							.filter(function(w){
								const result = w !== "" && prevVal !== w;
								prevVal = w;
								return result;
							});
								
			var pos = findIndex(words, selectedText);
			/*var pos = txt.substring(0, txt.indexOf(selectedText))
						  .split(' ')
						  .length;	
			*/
			showWordAnalysis(words[pos], surah, verse, pos+1);	
		}
	}else{
		alert('Select a word to analyze!');
	}
}

function findIndex(words, txt){
	var index = -1;
	if(words){
		words.every(function(w, i){
			if(removePunctuations(w).trim()
								    .includes(removePunctuations(txt)
								    .trim()))
			{
				index = i;
				return false;
			}
			return true;
		});
	}
	return index;
}

function showWordAnalysis(word, surah, verse, pos){
	var url = "https://www.almaany.com/quran/"+surah+"/"+verse+"/"+pos;
	if(parent.getLang){
		parent.window.open(url, '_blank');
	}else{
		window.open(url, '_blank');
	}
}

function SearchQuran(ctx, opt, text, callback){
	const response = ctx(text, opt)
					.then((data, ext)=>{								   
						if(callback)
							callback(data, ext);
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
	listWordInfo();
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
	var url = path + 'data/qrn/qsurah.json';
	listSurahsAsync(url, function(data){
		
		var div = $("#searchResult");
		div.empty();
		var table = '<table class="surahIndex"><th>Index</th><th>Surah Name (en)</th><th>Surah Name (ar)</th>';
		for (const [index, surah] of Object.entries(data)) {
			var tanzilLink = '<a style="cursor:pointer;font-size:18px" href="https://tanzil.net/#'+index+'" '+
				 'onclick="var w = parent ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+index+'</a>';
				 
			var enName = surah.en.substring(surah.en.indexOf('(')+1, surah.en.length-1)
								 .replace('The','')
								 .trim();
			if(enName.includes(' ')){
				enName = enName.split(' ')[0];
			}
			table = table+ '<tr>'+'<td>'+tanzilLink+'</td>'+
								'<td onclick="searchText(\''+
									enName
								+'\')" class="qword" style="font-szie:16px;">' +
								surah.en+
								'</td>'+
								'<td onclick="searchText(\''+
										surah.ar.trim()
											    .replace('ٱ','ا')
												.replace('إ','ا')
												.replace('ال','')+
									'\')" ' + 
								' class="qword">'+surah.ar+'</td>'+
							'</tr>';	
		}
		table = table+'</table>';
		div.append($(table));
	});
}

function searchText(txt){
	$("#searchText").val(txt);
	search();
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
				togglePlayButtons(verseKey, "visisble", "collapse");
			}
		});
		
		togglePlayButtons(verseKey, "collapse", "visisble");
	}
}

function stopPlayVerse(){
	if(parent && parent.stopAudio){
		parent.stopAudio();
	}
}