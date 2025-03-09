//
//	Author: munawwar_ali@yahoo.com
//

var lang = "ar";
var lastSuggestionInput = undefined;
var qf_list = [];
var q_summary = {};
var loadStatus;
var isAutoPlayQirat, changeQari;

window.onload = function(){
	
	$("#searchText").keyup(function(event) {
		if (event.keyCode === 13) {
			$("#SearchQ").click();
		}
	});

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
	var opt = { language: window.QuranJS.Language.ENGLISH, size: 10};
	if(pageNumber)
		opt.page = pageNumber;
	// check if verse key
	if(text.trim().match(/^\d{1,3}\:\d{1,3}$/g)){
		ctx = window.QuranJS.Verses.findByKey;
		opt = { words: 1};
	}
	
	div.html('Searching '+text+' in the Quran...');
	SearchQuran(ctx, opt, text, function(data){
		//console.log(data);
		
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
	
			var verseKey = text.trim(); //"";	
			var keys = verseKey.split(":");
			var verseNumber = parseInt(keys[1]);
			div.html('');
			
			// Add Next & Prev navigation for single verse
			var nav = '<div style="font-size:12px;margin-bottom:10px;padding:10px;background-color:#9DBF6C;">';
			if(verseNumber > 1){
				nav +=  '<span onclick="searchText(\''+(keys[0])+':'+(verseNumber-1)+'\')" '+
						'style="cursor:pointer;margin-right:20px;">'+
						'<b>&lt;&nbsp;Prev</b></span>' +
						'<span>&nbsp;&nbsp;</span>';
			}
			
			//add play surah option
			var checked = isAutoPlayQirat ? 'checked': '';
			var chk = '<span>'+
						'<input id="chkTafsir" style="border: 4px solid #8585D4;" type="Checkbox" '+
						' onclick="playTafsir(\''+verseKey+'\')">'+
						'&nbsp;Tafsir&nbsp;'+
						'<input id="chkQir" style="border: 4px solid #8585D4;" type="Checkbox" '+
						checked+
						' onclick="onVerseLoaded(\''+(+keys[0])+'\','+ verseNumber +');">'+
						'&nbsp;Qirat&nbsp;'+
					  '</span>';
			nav += chk;
			
			// add next
			nav += '<span onclick="searchText(\''+(+keys[0])+':'+(verseNumber+1)+'\')" '+
						 'style="cursor:pointer;margin-left:20px;">'+
						 '<b>Next&nbsp;&gt;</b></span>';
			nav += '</div>';
			div.append($(nav));
			onVerseLoaded(keys[0], verseNumber);
			
			// Try to search the key and get exact vesre
			//SearchQuran(window.QuranJS.Search.search, 
			//		    { language: window.QuranJS.Language.ENGLISH, size: 50 }, 
			//			ayahText, 
			searchVerseKey(1, ayahText, verseKey,
			function(data2){
				data2.results.forEach(function(res2){
					var resulText = res2.highlighted ?? res2.text;
					if(resulText){
						var verse2 = resulText.replace(/[<>\/a-zA-Z]+/ig, '');
						if(res2.verseKey == verseKey){
							displayVerse(div, verse2, verseKey, { words: res2.words, controls: true, direction: 'rtl', ayahOption: $("#ayah-options").val() });
							
							// Try to add English translation
							SearchQuran(window.QuranJS.Verses.findByKey, { 
								words:1, 
								language: window.QuranJS.Language.ENGLISH, 
								size: 10
							}, 
							verseKey, 
							function(data3){
								displayVerse(div, data3.words[0].translation.text, verseKey, {
									words: data3.words,
									bgColor: '#F6F0F2',
									direction: 'ltr'
								});
								
								// Try to add Urdu translation
								SearchQuran(window.QuranJS.Verses.findByKey, 
											{ words:1, language: window.QuranJS.Language.URDU, size: 10 }, 
											verseKey, 
								function(data4){
									displayVerse(div, data4.words[0].translation.text, verseKey, {
										words: data4.words,
										bgColor: '#E8EEF4',
										direction: 'rtl'
									});
									
									// Try to add Hindi translation
									SearchQuran(window.QuranJS.Verses.findByKey, 
												{ words:1, language: window.QuranJS.Language.HINDI, size: 10 }, 
												verseKey, 
									function(data5){
										displayVerse(div, data5.words[0].translation.text, verseKey, {
											words: data5.words,
											bgColor: '#E8EEF4',
											direction: 'ltr'
										});
										
										//Add tafsir
										getVerseTafsir(null, verseKey, function(t, s){
											div.append($('<div id="tafsir" style="'+s+'">'+t.text+'</div>'));
										});
									});

								});
							});
							return true;
						}
					}
				});
			});
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
					'<span onclick="search('+(data.currentPage-1)+')" style="cursor:pointer;margin-right:20px;">'+
						'<b>&lt;&nbsp;Prev</b></span>' 
					: '') +
				  '<span>'+ data.currentPage +' of ' + data.totalPages+ '<span>'+
				  (data.currentPage < data.totalPages ? 
					'<span onclick="search('+(data.currentPage+1)+')" style="cursor:pointer;margin-left:20px;">'+
						'<b>Next&nbsp;&gt;</b></span>' 
					: '') +
				  '</div>';
		div.append($(nav));
		
		data.results.forEach(function(res){
			var resulText = res.highlighted ?? res.text;
			if(resulText){
				//var verseKeys = res.verseKey.split(":");
				var verse = resulText.replace(/[<>\/a-zA-Z]+/ig, '');
				displayVerse(div, verse, res.verseKey, { 
					words: res.words, 
					controls: true, 
					translateLink: true,
					direction: 'rtl',
					ayahOption: $("#ayah-options").val()
				});
			}
		});
	});
}

function searchVerseKey(page, ayahText, verseKey, callback){
	
	SearchQuran(window.QuranJS.Search.search, { 
		language: window.QuranJS.Language.ENGLISH, 
		size: 50,
		page: page		
	}, 	
	ayahText, function(data){
		var res = data.results.filter(x => x.verseKey === verseKey);
		if(res.length > 0){
			callback(data);
		}
		else if(data.currentPage < data.totalPages){
			searchVerseKey(data.currentPage+1, ayahText, verseKey, callback);
		}
	});
}

function changeTafsir(){
	const text = arRemovePunct(document.getElementById("searchText").value);
	if(text.trim().match(/^\d{1,3}\:\d{1,3}$/g)){
		var div = $("#tafsir");
		if(div.length > 0){
			$("#chkTafsir").prop('checked', '');
			stopPlayVerse();
			getVerseTafsir(null, text, function(t){
				div.html(t.text);
			});
		}
	}
}

//https://github.com/spa5k/tafsir_api
function getVerseTafsir(id, verseKey, callback){

	var div = $("#"+id);
	var alink = $("#"+id+'_tafsir');
	alink.addClass('blink');
	var scrollPosition = $(window).scrollTop();
	
	var tafsir = $("#tafsir-options").val();
	var style = tafsir.startsWith("ur-") ? " font-size:18px;":" font-size:16px;";
	var vKey = verseKey.split(":");
	var url = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/"+tafsir+"/"+vKey[0]+"/"+vKey[1]+".json";
	loadJsonData(url, function(data){
		
		if(callback){
			callback(data, style);
			return;
		}
		
		
		var childId = id+'_tafsir_123';
		var elem = document.getElementById(childId); 
		if(elem)
			elem.parentNode.removeChild(elem);

		div.append($('<div id="'+childId+'" style="'+style+'">'+data.text+'</div>'));
		
		alink.removeClass('blink');
		$(window).scrollTop(scrollPosition);
	});
}

function getVerseTranslation(id, verseKey, sfx = '_en', lang = window.QuranJS.Language.ENGLISH){
	var div = $("#"+id);
	var alink = $("#"+id+sfx);
	alink.addClass('blink');
	SearchQuran(window.QuranJS.Verses.findByKey, { 
				words: 1, 
				language:  lang
			}, 
			verseKey, 
	  function(data){	
		if(!data){
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
			
			displayVerse(div, ayahText, verseKey, { 
				words: data.words,
				bgColor: sfx === '_en' ? '#F6F0F2' : '#E8EEF4',
				keepFocus: true,
				direction: (sfx === '_ar' || sfx === '_ur') ? 'rtl' : 'ltr'
			});
			
			var scrollPosition = $(window).scrollTop();
			alink.remove();
			$(window).scrollTop(scrollPosition);
		}
	});
}

function displayVerse(div, verse, verseKey, options){
	var verseKeys = verseKey.split(":");
	var playOptions = getPlayOptions(verseKey, verseKeys);
	var analysisOptions = getAnalysisOptions(verse, verseKeys);
	var tanzilLink = '<a title="Click to view in tanzil.com" '+
						'style="position:absolute;margin-top:6px;" '+
						'href="https://tanzil.net/#'+verseKey+'" '+
						'onclick="var w = parent.window ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+
					 '[' + verseKey+ ']'+
					 '</a>';
					 
	var transLinkId = 'div'+verseKeys[0]+'_'+verseKeys[1];
	var translationLink = '<a title="Click to see translation" id="'+transLinkId+'_en"'+
	'style="position:absolute;margin-right:10px;margin-left:-18px;margin-top:6px;font-size:12px;" '+
							 'href="#" onclick="getVerseTranslation(\''+transLinkId+'\', \''+verseKey+'\',\'_en\');">'+
					 '[en]</a>';
	//'ur'
		translationLink +=				 
		'<a title="Click to see translation" id="'+transLinkId+'_ur"'+
			'style="position:absolute;margin-right:10px;margin-left:-44px;margin-top:6px;font-size:12px;" '+
			'href="#" onclick="getVerseTranslation(\''+transLinkId+'\', \''+verseKey+'\', \'_ur\',window.QuranJS.Language.URDU);">'+
		'[ur]</a>';
	//
	
	//'hi'
		translationLink +=				 
		'<a title="Click to see translation" id="'+transLinkId+'_hi"'+
			'style="position:absolute;margin-right:10px;margin-left:-68px;margin-top:6px;font-size:12px;" '+
			'href="#" onclick="getVerseTranslation(\''+transLinkId+'\', \''+verseKey+'\', \'_hi\',window.QuranJS.Language.HINDI);">'+
		'[hi]</a>';
	//
					 
	//tafseer link
		translationLink +=				 
		'<a title="Click to see tafseer" id="'+transLinkId+'_tafsir"'+
			'style="position:absolute;margin-right:10px;margin-left:-108px;margin-top:6px;font-size:12px;" '+
			'href="#" onclick="getVerseTafsir(\''+transLinkId+'\', \''+verseKey+'\');">'+
		'[tafsir]</a>';
	//

	var bgColor = options.bgColor ? 'background-color:'+options.bgColor+';' : '';
	var direction =  options.direction ? 'direction:'+options.direction+';' :
						verse.match(/^[\x00-\x7F]+/g) ? '' : 'direction:rtl;';
	var divHtml = '<div id="vdiv'+verseKeys[0]+verseKeys[1]+'"  style="padding-bottom:4px;font-size:22px;display:inline-flex;flex-wrap:wrap;align-items:center;justify-content:center;'+direction+bgColor+'">';
	if(options.ayahOption === "image"){
		divHtml += '<img style="padding:4px;max-width:96%" src="https://everyayah.com/data/images_png/'+verseKeys[0]+'_'+verseKeys[1]+'.png" />';
	}else{
		divHtml += getWordSpans(verse, options ? options.words: undefined, verseKeys[0]+verseKeys[1]);
	}
	divHtml +=	'</div>'+
				  '<div style="font-size:14px;padding-bottom:12px;" id="'+transLinkId+'">';
	divHtml += (options.translateLink) ? '<span style="padding-right:12px;">'+
						translationLink+'</span>':'';
	var surah_name = surah_list ? '<span style="margin:auto;font-size:14px;padding-right:6px;color:#49348D;"><b>'+surah_list[parseInt(verseKeys[0])].ar+'</b></span>' : '';
		
	divHtml += (options == undefined || options.controls) ?
					   '<span style="padding-right:8px;">'+analysisOptions+'</span>'+
					   '<span style="padding-right:8px;">'+playOptions+'</span>'+
					   surah_name+
					   '<span style="margin:auto;">'+tanzilLink+'</span>'
					   :'';
	divHtml += '</div>';
	div.append($(divHtml));
	
	if(options.keepFocus){
		//setTimeout(function(){
			var elem = $("#vdiv"+verseKeys[0]+verseKeys[1]);
			if(elem.length > 0){
				elem[0].scrollIntoView({
					behavior: 'smooth', 
					block: 'start', 
					inline: 'nearest'
				});
			}
		//}, 1);
	}
}

function selectWordInAyah(id){
	if(id.endsWith("-en"))
		id = id.replace(/\-en$/g, '');
	else if(id.endsWith("-ur"))
		id = id.replace(/\-ur$/g, '');
	else if(id.endsWith("-hi"))
		id = id.replace(/\-hi$/g, '');
	
	$(".word-ar").removeClass("sel-word");
	$(".word-en").removeClass("sel-word-en");
	$(".word-ur").removeClass("sel-word-ur");
	$(".word-hi").removeClass("sel-word-hi");
	
	$("#"+id).addClass("sel-word");	
	$("#"+id+"-en").addClass("sel-word-en");
	$("#"+id+"-ur").addClass("sel-word-ur");
	$("#"+id+"-hi").addClass("sel-word-hi");
}

function getWordSpans(verse, words, vId){
	if(words && words.length > 0){
		var language = undefined; //"en";
		var vSpans = '';
		words.map(function(w, i){
			var word = w.translation ? w.translation.text : w.text;
			if(language == undefined){
				if(w.translation){
					if(word.trim().match(/^[\x00-\x7F]+/g))
						language = "-en";
					else if(word.trim().match(/^[\u0900-\u097F]+/g))
						language = "-hi";
					else
						language = "-ur";
				}
				else language = "";
			}
			
			var wClass = language !== "" ? 'word'+language : 'word-ar';
			var id = language !== "" ? vId+'-'+i+'-word'+language : vId+'-'+i+'-word';
			vSpans += '<span id="'+id+'" class="'+wClass+'" onclick="selectWordInAyah(this.id)">'+
						word+
						'</span>&nbsp;';
		});
		return vSpans;
	}
	return verse;
}

function getPlayOptions(verseKey, verseKeys){
	var spanId = verseKeys[0]+"_"+verseKeys[1]; //res.verseKey.replace(":","_");
	var play = parent.playAudio ? '<span id="'+spanId+'">'+
								  
								  '<img title="Play Qirat" src="images/speech-enabled.png" style="visibility:visible;width:20px;cursor: pointer;" '+
								  'onclick="playVerse(\''+getQiratPlayUrl(verseKey)+'\',\''+verseKey+'\')"/>'+
								  
								  '<img title="Stop" src="images/stop.png" style="visibility:hidden;width:0px;cursor: pointer;" '+
								  'onclick="stopPlayVerse()"/>'+
								  '</span>':'';
  return play;
}

function getAnalysisOptions(verse, verseKeys){
	return '<span>'+			  
					'<span class="dropdown">'+
					  '<button class="dropbtn" '+
						'style="width:20px;'+
							   'background: url(images/analyze.jpg);' + 
							   'background-repeat: no-repeat;'+
							   'background-size: 20px 20px;"'+
						'>معني</button>'+
					  '<div class="dropdown-content">'
					    +
						'<a href="#" onclick="analyzeLocal()" >Analyze (تحليل)</a>'
						+
						'<a href="#" onclick="analyzeSelection('+verseKeys[0]+','+verseKeys[1]+')">Analyze (Almaany)</a>'
						+
						'<a href="#" onclick="analyzeLookup(\'https://www.almaany.com/ar/dict/ar-$/\')"' +
						'>Meaning (Almaany)</a>'
						+
						'<a href="#" onclick="analyzeLookup(\'https://glosbe.com/ar/$/\')"' +
						'>Meaning (Glosbe)</a>'
						+
					  '</div>'+
					'</span>'+
					
					/*'<img id="copyIcon" src="images/copy.jpg" style="margin-left:10px;visibility:visible;width:20px;cursor: pointer;" '+
					'onclick="copyTextToClipboard(\''+verse.replace(/[<>\/a-zA-Z]+/ig, '')+'\');"/>'+
					*/
		'</span>';
}

function analyzeLookup(url){
	let selectedText = $(".sel-word").text().trim();	
	lookupEx(url, $(".sel-word").text(), "Select a word (from the ayah)!");
}

function analyzeSelection(surah, verse){
	let wordElem = $(".sel-word");
	let selectedWord = wordElem.text().trim();
	if (selectedWord){ 
		var txt = removePunctuations(selectedWord.trim());
		if(txt){								
			var pos = parseInt(wordElem[0].id.split("-")[1]);
			showWordAnalysis(selectedWord, surah, verse, pos+1);	
		}
	}else{
		alert('Select a word (from the ayah) to analyze!');
	}
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
var surah_list;
function listSurahs(){
	$("#qari").hide();
	var path = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
	var url = path + 'data/qrn/qsurah.json';
	listSurahsAsync(url, function(data){
	
		surah_list = data;
		var div = $("#searchResult");
		div.empty();
		var table = '<table class="surahIndex"><th>Index</th><th>#Ayah</th><th>Surah(en)</th><th>Surah</th>';
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
								'<td style="font-size:14px;cursor:pointer;" '+
									'onclick="changeQari=true;isAutoPlayQirat=false; searchText(\''+index+':1\')">1-'+surah.ayahCount+'&nbsp;&#9835;</td>'+
								'<td onclick="searchText(\''+
									enName
								+'\')" class="qword" style="font-szie:13px;">' +
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

function selectQariForLanguage(lang){
	switch(lang){
		case 'en':
			$("#qari-options").val('English/Sahih_Intnl_Ibrahim_Walk_192kbps');
		break;
		
		case 'ur':
			$("#qari-options").val('translations/urdu_shamshad_ali_khan_46kbps');
		break;
		
		case 'ar':
			$("#qari-options").val('AbdulSamad_64kbps_QuranExplorer.Com');
		break;
	}
}

function playTafsir(verseKey){

	var isPlayTafsir = $("#chkTafsir").prop('checked');
	if(isPlayTafsir && parent.playText){
		$("#chkQir").prop('checked', '');
		var lang = $("#tafsir-options").val().substring(0,2);
		//getVerseTafsir(null, verseKey, function(t){
			//$("#tafsir").html(t.text); 	
			//parent.playText(t.text, lang === 'ur' ? 'ur-PK':
			//						lang === 'ar' ? 'ar-SA': 'en-US');
		//});

		var text = $("#tafsir").html(); 	
		parent.playText(text, lang === 'ur' ? 'ur-PK':
							  lang === 'ar' ? 'ar-SA': 'en-US');
		
	}else{
		stopPlayVerse();
	}
}

function onVerseLoaded(chapter, verse){
	isAutoPlayQirat = $("#chkQir").prop('checked');
	if(isAutoPlayQirat){
		if(changeQari && parent && parent.getLang){
			changeQari = undefined;
			selectQariForLanguage(parent.getLang());
		}
		
		var verseKey  = chapter + ":" + (verse);
		var play = parent.playAudio;
		setTimeout(function(){
			playVerse(getQiratPlayUrl(verseKey), verseKey, function(msg){
				if(msg === "ended"){					
					var nextVerse = chapter + ":" + (verse+1);
					setTimeout(function(){
						searchText(nextVerse);
					}, 300);
				}
			});
		},100);
	}
	else{
		stopPlayVerse();
	}
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
	
	var vW = v[0] === 'v' ? 'width:20px' : 'width:0px';
	var hW = h[0] === 'v' ? 'width:20px' : 'width:0px';
	elem.children[0].style = 'visibility:'+v+';'+vW+';cursor:pointer;';
	elem.children[1].style = 'visibility:'+h+';'+hW+';cursor:pointer;';
}

function updateLang(url){
	lang = parent.getLang ? parent.getLang() : lang;
	var current_url = decodeURI(url);
	var current_lang = current_url.replace("https://glosbe.com/ar/",'').split("/");
	return encodeURI("https://glosbe.com/ar/"+lang+"/"+current_lang[1]);
}

function playVerse(url, verseKey, cb){
	
	$("#chkTafsir").prop('checked', '');
	stopPlayVerse();
			
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
			
			if (cb) cb(action);
		});
		
		togglePlayButtons(verseKey, "collapse", "visisble");
	}
}

function stopPlayVerse(){	
	if(parent && parent.stopAudio){
		parent.stopAudio();
	}
}