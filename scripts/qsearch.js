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

	//Fill Juz select options
	var jOptions = $("#juz-options");
	for(var j=1; j <31; j++){
		jOptions.append($('<option value="juz'+j+'">Juz '+j+'</option>'));
	}
	
	//Fill Page select options
	var pOptions = $("#page-options");
	for(var j=1; j <605; j++){
		pOptions.append($('<option value="page'+j+'">Page '+j+'</option>'));
	}
	
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
	loadQuranPdfOptions();
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
	$("#qt-duration").hide();
	$("#juz").hide();
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
	$("#qt-duration").hide();
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
	var verseLinkOptions = getVerseLinkOptions(verseKey);
					 
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
					   '<span style="margin-top:-4;padding-right:8px;cursor:pointer;">'+
							'<a href="#" onclick="getReferences()">References</a></span>'+
					   '<span style="padding-right:8px;">'+analysisOptions+'</span>'+
					   '<span style="padding-right:8px;">'+playOptions+'</span>'+
					   surah_name+
					   '<span style="margin:auto;">'+verseLinkOptions+'</span>'
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

function reloadVerse(verseKey){
	$("#searchText").val(verseKey);
	search();
}

function getReferences(){
	var word = $(".sel-word").text().trim();
	if(word !== ""){
		$("#searchText").val(word);
		search();
	}
}

var last_ch_play_id;
function playQuranChapterUrl(url, id){

  	if (last_ch_play_id)
		stopQuranChapter(last_ch_play_id);
	$("#"+id+"+.dropdown-content").hide();
	$("#"+id).hide();
	$("#"+id+"-progress").show();
	var durationBar = $("#qt-duration");
	
	if(parent && parent.playAudio){
		
		last_ch_play_id = id;
		if(id.startsWith('t-ch')){
				$("#"+id.replace('t-ch','t-pdf')).hide(); //hide tafseer icon
		}
		
		var pauseBtn = $("#"+id+"-pause");
		parent.playAudio(url, function(action, data){		
			if(action == "loadstart"){
				$("#"+id).hide();
				$("#"+id+"-progress").show();
				durationBar.attr('value',0);
			}
			else
			if(action == "progress"){
				if(data && data.ct)
					durationBar.attr('value', data.ct);
			}
			else
			if(action == "loadeddata"){
				if(data){
					durationBar.attr('max', data.duration);
					durationBar.attr('value', data.ct);
					durationBar.css('display', 'block');
				}

				$("#"+id+"-progress").hide();
				pauseBtn.show();
				$("#"+id+"-stop").show();
				$("#"+id+"-fb").show();
				$("#"+id+"-ff").show();
				$("#"+id).hide();
				selectSurahCell($("#"+id).parent().parent().parent(), true);
			}
			else
			if(action == "pause"){
				pauseBtn.html(pauseBtn.html() === '\u23F8' ? '\u23EF' : '\u23F8');
			}
			else if(action == "ended"){
				stopQuranChapter(id);
				if(last_ch_play_id)
					stopQuranChapter(last_ch_play_id);
				last_ch_play_id = undefined;
				durationBar.hide();
			}
		});
	}	
}

function fastplayQuranChapter(id, fbOrff){
	if(parent && parent.changeAudioTime){
		parent.changeAudioTime(fbOrff);
	}
}

function pauseOrplayQuranChapter(id){

	if(parent && parent.pauseAudio && parent.resumeAudio){
		
		var pauseBtn = $("#"+id+"-pause");
		if(pauseBtn.html() === "\u23EF"){ // resume
			parent.resumeAudio();
			pauseBtn.html('\u23F8'); //pause			
		}else{
			parent.pauseAudio();
		} 
	}
}

function stopQuranChapter(id){

	if(parent && parent.stopAudio){
		parent.stopAudio();

		setTimeout(function(){
			$("#"+id+"-pause").hide();
			$("#"+id+"-stop").hide();
			$("#"+id+"-fb").hide();
			$("#"+id+"-ff").hide();
			$("#qt-duration").hide();
			selectSurahCell($("#"+id).parent().parent().parent(), false);
			if(id.startsWith('t-ch')){
				$("#"+id.replace('t-ch','t-pdf')).show();
			}
		},10);
	}
	$("#"+id).show();
}

function playOrStopCurrentPage(elem){
	var page = $("#page-options").val().replace('page','');
	if(page.length < 2) page = '0'+page;
	if(page.length < 3) page = '0'+page;
	var url = 'https://archive.org/download/QuranTransliterationMP3/pg'+page+'.mp3';
	
	var durationBar = $("#qt-duration");
	var state = $(elem).html();
	if(state === '▶'){ //play
		$(elem).html('⏹');
		if(parent && parent.playAudio){
			parent.playAudio(url, function(action, data){
				
				if(action == "loadstart"){
					durationBar.attr('value',0);
				}
				else if(action == "progress"){
					if(data && data.ct)
						durationBar.attr('value', data.ct);
				}
				else if(action == "loadeddata"){
					if(data){
						durationBar.attr('max', data.duration);
						durationBar.attr('value', data.ct);
						durationBar.css('display', 'block');
					}
				}else if(action == "ended"){
					$(elem).html('▶');
					durationBar.hide();
				}
			});
		}
	}else{ // stop
		if(parent && parent.stopAudio){
			parent.stopAudio();
			$(elem).html('▶');
			durationBar.hide();
		}
	}
}

function encodeTafsirUrl(url){
	return encodeURI(url).replace(/'/g, "%27")
						 .replace(/\(/, '%28')
						 .replace(/\)/, '%29')
						 .replace(/%E2%80%8E/g, '');
}

function getTafsirPdfOptions(index, chapterEn, chapterAr){
	
	var tafasir = {
			"Tafseer Qurtubi (Urdu)": 
			"https://archive.org/download/tafsir-al-qurtubi/surah-@index@_@chapter-en@.pdf",
			
			"Fil Zial al-Quran (English)":
			"https://archive.org/download/tafsir-fi-zilal-al-quran/surah-@index@_@chapter-en@.pdf"
			
			//"Tafseer Ibn-e-Kaseer (Urdu)":
			//"https://archive.org/download/TafseerIbnKathirenglish114SurahsComplete/@index@@chapter-en@.pdf"
	};
	var options = '';
	var id = 't-pdf'+index;
	
	for(const [k,v] of Object.entries(tafasir)){
		
		var ch = index > 99 ? index : index > 9 ? "0"+index : "00"+index;
		var url = v;
		var cn = chapterEn.split(" ")[0];
		switch(k){
			
			case "Tafseer Ibn-e-Kaseer (Urdu)":{
				cn = cn.replace('\'', '');
				if(cn.includes('-'))
					cn = cn.split('-')[1];
				
				var chapter_map = {
					'Fatihah': 'Fateh',
					'Baqarah': 'BaqarahI'
				};
				url = url = url.replace('@index@', ch);
				if(chapter_map[cn])
					url = url.replace('@chapter-en@', chapter_map[cn]);
				else
					url = url.replace('@chapter-en@', cn);
			}
			break;
			
			case "Fil Zial al-Quran (English)":
			case "Tafseer Qurtubi (Urdu)":{
				cn = cn.toLowerCase().replace('\'', '');
				var chapter_map = {
						 'al-imran': 'ali-imran',
						 'an-nahl': 'al-nahl',
						 'al-muminoon': 'al-muminun',
						 'an-noor': 'an-nur',
						 'al-ankaboot': 'al-ankabut',
						 'ar-room': 'ar-rum',
						 'ya-seen':'yasin',
						 'as-saaffat': 'as-saffat',
						 'sad': 'saad',
						 'al-jathiya': 'al-jathiyah',
						 'qaf': 'qaaf',
						 'adh-dhariyat': 'az-zariyat',
						 'at-tur': 'at-thur',
						 'al-munafiqoon': 'al-munafiqun',
						 'al-haaqqah': 'al-haqqah',
						 'nooh': 'nuh',
						 'al-jinn': 'al-jin',
						 'al-muddaththir': 'al-muddatthir',
						 'al-inshiqaq': 'al-insyiqaq',
						 'al-burooj': 'al-buruj',
						 'al-ghashiya': 'al-ghashiyah',
						 'al-layl': 'al-lail',
						 'as-sharh': 'al-inshirah',
						 'quraish': 'al-quraish',
						 'al-kauthor': 'al-kauthar',
						 'al-kafiroon': 'al-kafirun'
					};
					
					url = url = url.replace('@index@', ch);
					if(chapter_map[cn])
						url = url.replace('@chapter-en@', chapter_map[cn]);
					else
						url = url.replace('@chapter-en@', cn);
			}
			break;
		}
		
		var isAndroid = isOS("Android");				   
		var openlink = 'var w = parent.window ? parent.window : window; w.'+
					(isAndroid ? 'open(\''+encodeURI(url)+'\', \'_blank\');':
								 'openInline(this.href);');
		options += '<a href="'+(isAndroid ? '#' : encodeURI(url))+'" onclick="'+openlink+'">'+k+'</a>';
	}
	return '<span class="dropdown" style="direction:ltr;">'+
				'<button id="'+id+'" '+
					'class="dropbtn" onclick="toggleDropdownContent(this, true)" '+
					'style="background-color:transparent;color:black;">📓</button>'+
					'<div class="dropdown-content" style="">'+options+'</div>'+
			'</span>';
}

function getTafsirAudioOptions(index, chapterEn, chapterAr, ayatCount){
	
	var tafasir = {
			"Tafseer Ibne-kaseer (Urdu)": 
			"https://archive.org/download/Tafsir-ibne-kaseer-kathir-urdu-----audio-mp3-hq/@index@ - @chapter-en@ - @chapter-ar@.mp3",
			
			"Tafheem-ul-Quran (Syed Abul-Ala Moududi)": "https://archive.org/download/Tafheem-ul-Quran-by-Syed-Abul-Ala-Moududi-Audio-MP3-CD/@index@ - @chapter-en@ - @chapter-ar@.mp3",
			
			"Bayan-ul-Quran (Dr. Israr Ahmed)": 
			"https://archive.org/download/BayanUlQuranInUrduByDr.IsrarAhmedAudioMP3-HQ/@index@ - @chapter-en@ - @chapter-ar@.mp3",
			
			//"English Tafsir (Mohsin Khan)": 
			//"https://archive.org/download/complete-quran-english-tafsir-audio-muhsin-khan/@index@-@chapter-en@.mp3",
			
			"Maarif-ul-Quran (Mufti Shafi Usmani)":
			"https://archive.org/download/maarifulquran-urdu-audio/@index@Surah@chapter-en@@Part@-MaarifulquranByMuftiShafiUsmaniRah.mp3"
	};
	var options = '';
	var id = 't-ch'+index;
	
	for(const [k,v] of Object.entries(tafasir)){
		
			var ch = index > 99 ? index : index > 9 ? "0"+index : "00"+index;
			var url = v;
			switch(k){
				
				case "Tafseer Ibne-kaseer (Urdu)":
				case "Bayan-ul-Quran (Dr. Israr Ahmed)":
				case "Tafheem-ul-Quran (Syed Abul-Ala Moududi)":
					url = url.replace('@index@', ch)
					   .replace('@chapter-en@', chapterEn.replace(' ( Hud )', '')
														 .replace(' ( Ta-Ha )', '')
														 .replace(' ( Luqman )', '')
														 .replace(' ( Ya-seen )', '')
														 .replace(' ( Muhammad )', '')
														 .replace(' ( Noah )', '')
														 .replace(' ( Quraish )', ''))
					   .replace('@chapter-ar@', 'سورة '+chapterAr);
				break;
				
				case "Maarif-ul-Quran (Mufti Shafi Usmani)":{
					var cn = chapterEn.split(" ")[0].replace('\'', '')
													.replace('An-','Al-')
													.replace('At-','Al-')
													.replace('Ar-', 'Al-')
													.replace('Ash-', 'Al-')
													.replace('Az-', 'Al-')
													.replace('Ad-', 'Al-')
													.replace('At-', 'Al-');
					if(cn.startsWith('Al-') || cn.startsWith('As-'))
						cn = cn.toLowerCase()
							   .replace('al-', 'Al-')
							   .replace('as-', 'As-');
					
					var chapter_map = {
						'Al-fatihah': 'Al-fatiha',
						'Al-imran': 'Al-e-imran',
						'Hud': 'Hood',
						'Al-isra': 'BaniIsrael',
						'Al-muminoon': 'Al-muminun',
						'Al-ankaboot': 'Al-ankabut',
						'Ya-seen': 'Yaseen',
						'As-saaffat': 'As-saffat',
						'Sad': 'Saad',
						'Ghafir': 'Al-momin',
						'Fussilat': 'HameemAl-sajdah',
						'Al-jathiya': 'Al-jasiyah',
						'Al-fath': 'Al-fatah',
						'Adh-Dhariyat': 'Al-zariyat',
						'Al-tur': 'Al-toor',
						'Al-rahman': 'Al-rehman',
						'Al-hadid': 'Al-hadeed',
						'Al-mujadilah': 'Al-mujadalah',
						'Al-mumtahanah':'Al-mumtahinah',
						'Al-jumuah':'Al-juma',
						'Al-munafiqoon': 'Al-munafiqun',
						'Al-talaq': 'At-talaq',
						'Al-tahrim': 'At-tahrim',
						'Al-qalam': 'Noon',
						'Al-haaqqah': 'Al-haqqah',
						'Al-muddaththir':'Al-muddassir',
						'Al-insan':'Dahr',
						'Al-naba':'An-naba',
						'Al-naziat':'An-naziat',
						'Al-layl': 'Al-lail',
						'Al-dhuha': 'Al-zuha',
						'As-sharh':'Al-inshirah',
						'Al-tin': 'Al-teen',
						'Al-qariah':'Al-qaria',
						'Al-takathur':'Al-takasur',
						'Al-fil': 'Al-feel',
						'Quraish': 'Al-quraish',
						'Al-kauthor':'Al-kausar',
						'Al-masad': 'Al-lahab'
					};
					var ayat_map = {
						'001': ['Part01', 'Part02'],
						'002': ['AyatNo001To007', 'AyatNo008To020', 'AyatNo021To022', 'AyatNo025To033', 'AyatNo034To039','AyatNo040To046','AyatNo047To066',
								'AyatNo067To095','AyatNo096To103', 'AyatNo104To113', 'AyatNo114To121','AyatNo122To125','AyatNo126To129','AyatNo130To141',
								'AyatNo142To143','AyatNo144To153','AyatNo154To171','AyatNo172To173','AyatNo174To182','AyatNo183To187','AyatNo188To195',
								'AyatNo196To203','AyatNo204To215','AyatNo216To219','AyatNo219To228','AyatNo229To230','AyatNo238To252','AyatNo253To260',
								'AyatNo261To274','AyatNo275To281','AyatNo282To286'],
						'003': ['AyatNo001To017','AyatNo018To030','AyatNo031To054','AyatNo055To071','AyatNo072To092','AyatNo093To102','AyatNo103To105',
								'AyatNo106To120','AyatNo121To133','AyatNo134To145','AyatNo146To159','AyatNo160To178','AyatNo169To200'],
						'004': ['AyatNo001To003','AyatNo004To010','AyatNo011To014','AyatNo015To021','AyatNo022To028','AyatNo029To033','AyatNo034To038',
								'AyatNo039To052','AyatNo053To059','AyatNo060To070','AyatNo071To080','AyatNo081To091','AyatNo092To104','AyatNo105To126',
								'AyatNo127To135','AyatNo136To158','AyatNo159To200'],
						'005': ['AyatNo001To002','AyatNo003To004','AyatNo005To005','AyatNo006To014','AyatNo015To026','AyatNo027To034','AyatNo035To040',
								'AyatNo041To043','AyatNo044To050','AyatNo051To061','AyatNo062To069','AyatNo070To088','AyatNo089To096','AyatNo097To105','AyatNo106To120'],
						'006': ['AyatNo001To014','AyatNo015To032','AyatNo033To051','AyatNo052To062','AyatNo063To067','AyatNo068To081','AyatNo082To094',
								'AyatNo095To107','AyatNo108To117','AyatNo118To125','AyatNo126To136','AyatNo137To150','AyatNo151To153','AyatNo154To165'],
						'007': ['AyatNo001To025','AyatNo026To031','AyatNo032To043','AyatNo044To056','AyatNo057To072','AyatNo073To093','AyatNo094To122',
								'AyatNo123To141','AyatNo142To157','AyatNo158To171','AyatNo172To179','AyatNo180To193','AyatNo194To206'],
						'008': ['AyatNo001To010','AyatNo011To024','AyatNo025To038','AyatNo039To044','AyatNo045To058','AyatNo059To075'],
						'009': ['AyatNo001To011','AyatNo012To024','AyatNo025To030','AyatNo031To052','AyatNo053To060','AyatNo061To083',
								'AyatNo084To101','AyatNo102To114','AyatNo115To129'],
						'010': ['AyatNo001To010','AyatNo011To032','AyatNo033To061','AyatNo062To091','AyatNo092To109'],
						'011': ['AyatNo001To014','AyatNo015To035','AyatNo036To049','AyatNo050To083','AyatNo084To123'],
						'012': ['AyatNo001To020','AyatNo021To029','AyatNo030To051','AyatNo052To066','AyatNo067To087','AyatNo088To111'],
						'013': ['AyatNo001To015', 'AyatNo016To043'],
						'014': ['AyatNo001To008','AyatNo009To029','AyatNo030To052'],
						'016': ['AyatNo001To047','AyatNo048To070','AyatNo071To089','AyatNo090To113','AyatNo114To128'],
						'017': ['AyatNo001To021','AyatNo022To038','AyatNo039To065','AyatNo066To084','AyatNo085To111'],
						'018': ['AyatNo001To012','AyatNo013To044','AyatNo045To070','AyatNo071To091','AyatNo092To110'],
						'019': ['AyatNo001To040','AyatNo041To072','AyatNo073To099'],
						'020': ['AyatNo001To036','AyatNo037To044','AyatNo045To089', 'AyatNo090To135'],
						'021': ['AyatNo001To073','AyatNo074To086','AyatNo087To112'],
						'022': ['AyatNo001To024','AyatNo025To038','AyatNo039To072'],
						'023': ['AyatNo001To041','AyatNo042To118'],
						'024': ['AyatNo001To010','AyatNo011To026','AyatNo027To031','AyatNo032To040','AyatNo041To064'],
						'025': ['AyatNo001To044','AyatNo045To077'],
						'026': ['AyatNo001To122','AyatNo123To227'],
						'027': ['AyatNo001To028','AyatNo029To059','AyatNo060To093'],
						'028': ['AyatNo001To028','AyatNo029To060','AyatNo061To088'],
						'029': ['AyatNo001To044','AyatNo046To069'],
						'030': ['AyatNo001To041','AyatNo042To060'],
						'033': ['AyatNo001To027','AyatNo028To035','AyatNo036To048','AyatNo049To055','AyatNo056To073']
					};           
					url = url.replace('@index@', ch)
							 .replace('@chapter-en@', chapter_map[cn] ??  cn);
					if(ayat_map[ch] === undefined){
							var c = ayatCount+'';
							if(cn === 'Al-hijr') 
								c = '90';
							else if(cn === 'As-saaffat')
								c = '0182';
							else if(cn === 'Al-jumuah')
								c = '014';
							if(c.length < 2) c = '0'+c;
							if(c.length < 3) c = '0'+c;
							url = url.replace('@Part@', '-AyatNo001To'+c);
					}
					else{
						options += '<div class="dropdown-content dropdown2" style="position:relative">'+k+'</div>'+
								   '<div class="dropdown-content2" style="margin-left:60px;">';
								   
						ayat_map[ch].every(function(part){		
							var urlCopy = url.replace('@Part@', part.startsWith('A') ? '-'+part : part);
							options += '<p onclick="playQuranChapterUrl(\''+encodeTafsirUrl(urlCopy)+'\',\''+id+'\')">'+part+'</p>';
							return true;
						});
						options += '</div>';
						continue;
					}
				}
				break;
				
				case "English Tafsir (Mohsin Khan)": {
					var cn = chapterEn.split(" ")[0];
					if(cn.includes("-")){
						var t = cn.split("-");
						cn = t[0];
						for(var i=1; i<t.length; i++) cn += '-' + t[i].toLowerCase();
					}
					cn = cn.replace('\'','');
					var chapter_map = {
						 'Al-fatihah': 'Al-fatiha',
						 'Al-imran': 'Aal-e-imraan',
						 'An-nisa': 'An-nisaa',
						 'Al-maidah': 'Al-maaida',
						 'Al-anam': 'Al-anaam',
						 'Al-araf': 'Al-araaf',
						 'Al-anfal': 'Al-anfaal',
						 'Yunus': 'Yoonus',
						 'Yusuf': 'Yoosuf',
						 'Ibrahim': 'Ibraheem',
						 'Al-isra': 'Al-israa',
						 'Taha': 'Ta-ha',
						 'Al-anbiya': 'Al-anbiyaa',
						 'Al-furqan': 'Al-furqaan',
						 'Ash-shuara': 'Ash-shuaraa',
						 'Luqman': 'Luqmaan',
						 'Al-ahzab': 'Al-ahzaab',
						 'Fatir': 'Faatir',
						 'As-saaffat': 'As-saaffaat',
						 'Sad': 'Saad',
						 'Ghafir': 'Ghaafiral-mumin',
						 'Fussilat': 'Fussilatha-meem',
						 'Ash-shura': 'Ash-shoora',
						 'Ad-dukhan': 'Ad-dukhaan',
						 'Al-jathiya': 'Al-jaathiya',
						 'Al-ahqaf': 'Al-ahqaaf',
						 'Muhammad': 'Muhammadsaas',
						 'Al-hujurat': 'Al-hujuraat',
						 'Qaf': 'Qaaf',
						 'Adh-dhariyat': 'Adh-dhaariyaat',
						 'At-tur': 'At-toor',
						 'Ar-rahman': 'Ar-rahmaan',
						 'Al-waqiah': 'Al-waaqia',
						 'Al-hadid': 'Al-hadeed',
						 'Al-mujadilah': 'Al-mujaadila',
						 'Al-mumtahanah': 'Al-mumtahana',
						 'Al-jumuah': 'Al-jumua',
						 'Al-munafiqoon': 'Al-munaafiqoon',
						 'At-taghabun': 'At-taghaabun',
						 'At-tahrim': 'At-tahreem',
						 'Al-maarij': 'Al-maaarij',
						 'Al-qiyamah': 'Al-qiyaamah',
						 'Al-insan': 'Al-insaanad-dahr',
						 'An-naziat': 'An-naziaat',
						 'At-takwir': 'At-takweer',
						 'Al-infitar': 'Al-infitaar',
						 'Al-mutaffifin': 'Al-mutaffifeen',
						 'Al-inshiqaq': 'Al-inshiqaaq',
						 'At-tariq': 'At-taariq',
						 'Al-ghashiya': 'Al-ghaashiya',
						 'Ad-dhuha': 'Ad-duha',
						 'As-sharh': 'Al-inshirahash-sharh',
						 'At-tin': 'At-teen',
						 'Al-adiyat': 'Al-aadiyaat',
						 'Al-qariah': 'Al-qaaria',
						 'At-takathur': 'At-takaathur',
						 'Al-humazah': 'Al-humaza',
						 'Al-fil': 'Al-feel',
						 'Quraish': 'Quraysh',
						 'Al-maun': 'Al-maaoon',
						 'Al-kauthor': 'Al-kawthar',
						 'Al-kafiroon': 'Al-kaafiroon',
						 'Al-masad': 'Al-masadal-lahab',
						 'An-nas': 'An-naas'
					}
					url = url.replace('@index@', ch)
							 .replace('@chapter-en@', cn);
					if(chapter_map[cn])
						url = url.replace(cn, chapter_map[cn]);
				}
				break;
			}
			options += '<p onclick="playQuranChapterUrl(\''+encodeTafsirUrl(url)+'\',\''+id+'\')">'+k+'</p>';
	}
	
	return getPlayControlsHtml(id, options, '▶');
}

function getQuranAudioOptions(chapter, enName, ayahCount){
	
	var languages = ["Arabic", "Bangla", "English", "Gujarati", "Hindi", "Kashmiri", "Marathi", "Malayalam", "Persian", "Tamil", "Telugu", "Urdu"];
	var options = '';
	var id = 'q-ch'+chapter;
	
	languages.forEach(function(lang){
		var ch = chapter > 99 ? chapter : chapter > 9 ? "0"+chapter : "00"+chapter; 
		
		if(lang === "Marathi"){
			if(chapter > 77){
				var url = "https://archive.org/download/marathiqurantranslation/"+ch+"-Sura @chapter-en@ [Ayahs 1-"+ayahCount+"].mp3";
				url = url.replace("@chapter-en@", enName.split("(")[0].trim())
						 .replace('An-Naba\'', 'An-Nabaa')
						 .replace('Abasa', '\'Abasa')
						 .replace('Al-Mutaffifin', 'Al-Mutaffifeen')
						 .replace('Sura Al-Burooj', ' Sura Al-Buruj')
						 .replace('Al-Ghashiya', 'Al-Gashiya')
						 .replace('Al-Layl', 'Al-Lail')
						 .replace('As-Sharh', 'Al-Sharh')
						 .replace('Al-\'alaq', 'Al-\'Alaq')
						 .replace('Al-Bayyinah', 'Al-Baiyina')
						 .replace('Az-Zalzalah', 'Al-Zalzalah')
						 .replace('Al-\'adiyat', 'Al-\'Adiyat')
						 .replace('Al-Qari\'ah', 'Al-Qari\'a')
						 .replace('Al-Asr', 'Al-\'Asr')
						 .replace('Al-Humazah', 'Al-Humaza')
						 .replace('Al-Kauthor', 'Al-Kauthar')
						 .replace('Al-Kafiroon', 'Al-Kafirun');
						 
				if(enName.startsWith("Al-\'adiyat")){
					url = url.replace("1-11", "1-8");
				}
						 
				var url = encodeURI(url).replace(/'/g, "%27");
				options += '<p onclick="playQuranChapterUrl(\''+url+'\',\''+id+'\')">'+lang+'</p>';	
			}					
		}
		else if(lang === "Telugu"){
			if(chapter < 101){
				var url = encodeURI("https://archive.org/download/OnlyTeluguAudioQuranTranslationMp3/Telugu_Audio_Quran_Translation_Mp3_Quran/"+ch+"_Only_Telugu_Audio_Quran_Translation_Mp3_Quran_VideoQuran.Net.mp3");
				options += '<p onclick="playQuranChapterUrl(\''+url+'\',\''+id+'\')">'+lang+'</p>';				
			}
		}
		else{
			var url = encodeURI('https://www.truemuslims.net/Quran/'+lang+'/'+ch+'.mp3');
			options += '<p onclick="playQuranChapterUrl(\''+url+'\',\''+id+'\')">'+lang+'</p>';
		}
		return true;
	});
	
	return getPlayControlsHtml(id, options, '▶');
}

function getPlayControlsHtml(id, options, symbol){
	return '<span class="dropdown" style="direction:ltr;">'+
			  '<button id="'+id+'" '+
					   'class="dropbtn" onclick="toggleDropdownContent(this, true)" '+
					   'style="background-color:transparent;color:black;">'+symbol+'</button>'+
			   '<div class="dropdown-content" style="">'+options+'</div>'+
			   '<img id="'+id+'-progress" src="images/loading.gif" '+ 	
						'style="display:none;width:16px;"></img>'+
			   '<button id="'+id+'-fb" class="dropbtn" '+
					   'onclick="fastplayQuranChapter(\''+id+'\', false); toggleDropdownContent($(this).parent().first().next());" '+
					   'style="display:none;background-color:transparent;color:black;margin-left:1px;">\u23EA</button>'+ //FB
			   '<button id="'+id+'-pause" class="dropbtn" '+
					   'onclick="pauseOrplayQuranChapter(\''+id+'\');toggleDropdownContent($(this).parent().first().next());" '+
					   'style="display:none;background-color:transparent;color:black;margin-left:1px;">\u23F8</button>'+ //play/pause
			   '<button id="'+id+'-stop" class="dropbtn" '+
					   'onclick="stopQuranChapter(\''+id+'\'); toggleDropdownContent($(this).parent().first().next());" '+
					   'style="display:none;background-color:transparent;color:black;margin-left:1px;">\u23F9</button>'+ //stop
			   '<button id="'+id+'-ff" class="dropbtn" '+
					   'onclick="fastplayQuranChapter(\''+id+'\', true); toggleDropdownContent($(this).first().next().next());" '+
					   'style="display:none;background-color:transparent;color:black;margin-left:1px;">\u23E9</button>'+ //FF
		   '</span>';
}

//https://www.truemuslims.net
function loadQuranPdfOptions(){
	
	var languages = ["Arabic", "French-Quran", "Dutch-Quran", "Gujarati-Quran", "Hindi-Quran", "Kashmiri-Quran", "Malayalam-Quran", "Persian-Quran", "Tamil-Quran", "Sindhi-Quran", "Urdu-Quran"];
	var options = '';
	
	languages.forEach(function(lang){
		var l = lang === "Arabic" ? "arabic": lang;
		var url = 'https://www.truemuslims.net/PDF-quran-in-all-languages/'+l+'.pdf';
		options += '<a '+
			(isOS("Android") ?
				'href="#" onclick="var w = parent.window ? parent.window : window; w.open(\''+url+'\');">'
				:
				'href="'+url+'" onclick="var w = parent.window ? parent.window : window; w.openInline(this.href); return false;">')
					+lang +
				   '</a>';
		return true;
	});
	
	$("#qPDF").html($(options));
}


function getVerseLinkOptions(verseKey){
	
	var localLink = '<a href="#" title="Reload verse" onclick="reloadVerse(\''+verseKey+'\')">Research</a>';
	var tanzilLink = '<a title="Click to view in tanzil.com" '+
						'href="https://tanzil.net/#'+verseKey+'" '+
						'onclick="var w = parent.window ? parent.window : window; w.open(this.href, \'_blank\'); return false;">'+
					 'tanzil.net'+
					 '</a>';

	return '<span>'+			  
					'<span class="dropdown">'+
					  '<button class="dropbtn" style="width:50px; background-color:#EEEEEE;color:black;">'+
						'['+verseKey+']</button>'+
					  '<div class="dropdown-content">'
					    +
						localLink
						+
						tanzilLink
						+
					  '</div>'+
					'</span>'+
		'</span>';
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
	$("#juz").hide();
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
	$("#juz").hide();
	$("#qari").hide();
	var text = $("#searchText").val();
	listWordInfo();
}

function selectWordAndSearchInQuran(word){
	$('#searchText').val(arRemovePunct(word));
	search();
}

function updatePage(){
	var s = $("#surah-options").val().replace('s','');
	var entry = surah_list[s];
	var page = entry.pages.includes('-') ? entry.pages.split('-')[0] : entry.pages;
	$("#page-options").val('page'+page);
	displayQPage();
}

function navigateJuz(next){
	
	var sel = $("#juz-options");
	if(sel.is(':visible')){
		var opt = sel.val();
		if(opt === "all") return;
		var value = parseInt(opt.replace('juz',''))
		value += next ? +1:-1;
		if(value > 0 && value < 31){
			sel.val('juz'+value);
			filterSurahs(sel, 'juz'+value);
		}
	}
	
	sel = $("#page-options");
	if(sel.is(':visible')){
		var opt = sel.val();
		var value = parseInt(opt.replace('page',''))
		value += next ? +1:-1;
		if(value > 0 && value < 605){
			sel.val('page'+value);
			displayQPage();
		}
	}
}

function filterSurahs(elem, cname){
	var opt = cname ?? $("#juz-options").val();
	if(opt === "all"){
		$(".surahIndex [class^=\'juz\']").show();
		if(elem){
			$(elem).prev().css('color','transparent');
			$(elem).next().next().css('color','transparent');
		}
	}else{
		$(".surahIndex [class^=\'juz\']").hide();
		$("."+opt).show();
		if(elem){
			$(elem).prev().css('color','crimson');
			$(elem).next().next().css('color','crimson');
		}
	}
}
/*
Loads Quran surah index
*/
var surah_list;
function listSurahs(){
	$("#qari").hide();
	$("#juz").show();
	var path = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
	var url = path + 'data/qrn/qsurah.json';
	listSurahsAsync(url, function(data){
	
		var sOptions = $("#surah-options");
		surah_list = data;
		var div = $("#searchResult");
		div.empty();
		var table = '<div id="tqv2" style="margin-top:10px;width:100%;display:none;">'+
						'<img style="position:relative;width:100%;" src=""></img>'+
						'<img style="display:none;position:absolute;opacity:30%;left:35%;top:35%;width:30%;" src="images/loading.gif"></img>'+
					'</div>'+
				'<table id="tqv1" style="direction:rtl;max-width:512px;margin:auto;padding:0;" '+
						   'class="surahIndex">'+
						   '<tr><th>Surah</th>'+
						   '<th class="chkQ">&nbsp;Qirat&nbsp;</th>'+
						   '<th class="chkT">Tafsir</th>'+
						   '<th class="chkR">Search</th></tr>';
		for (const [index, surah] of Object.entries(data)) {
			
			var juz	= surah.juz.map((j) => 'juz'+j).join(' ');
			var enName = surah.en.substring(surah.en.indexOf('(')+1, surah.en.length-1)
								 .replace('The','')
								 .trim();
			if(enName.includes(' ')){
				enName = enName.split(' ')[0];
			}
			
			sOptions.append(
				$('<option value="'+index+'">'+index+' ' + surah.ar+'</option>')
			);
			
			table += '<tr class="'+juz+'">'+
						 '<td onclick="searchText(\''+enName+'\')" '+
							 'class="qword" style="max-width:80px;font-szie:14px;padding:0;padding-bottom:6px;">'+index+'<br/>'+
							 //'<b>'+surah.ar+'</b><br/>'+
							 '<img src="https://raw.githubusercontent.com/gyenabubakar/surah-name-glyphs/3498a6dcde6b7cb3b0ac4c7d7c0754d385ab31fe/svg/'+index+'.svg"></img><br/>'+
								'<span style="font-size:12px;">'+
									surah.en.substring(surah.en.indexOf("(")).replace(/\(([^\s])/g, '\( $1')+
								'</span>'+
						 '</td>'+
						 '<td class="chkQ" style="font-size:14px;cursor:pointer;padding:0;">'+
							 '<span>'+getQuranAudioOptions(index, surah.en, surah.ayahCount)+'</span>'+
						 '</td>'+
						 '<td class="chkT" style="font-size:14px;cursor:pointer;padding:0;">'+
							 '<span>'+getTafsirAudioOptions(index, surah.en, surah.ar, surah.ayahCount)+'</span>'+
							 '<span>'+getTafsirPdfOptions(index, surah.en, surah.ar, surah.ayahCount)+'</span>'+
						 '</td>'+
						 '<td class="chkR" style="font-size:14px;cursor:pointer;padding:0;"> '+
							 '<span class="dropbtn" '+
							   'title="Research" '+
							   'style="background-color:transparent;color:black;" '+
							   'onclick="changeQari=true;isAutoPlayQirat=false; searchText(\''+index+':1\')">'+
							   //'1‧‧‧'.concat(surah.ayahCount)+
							   '<b>'+(surah.ayahCount)+'‧‧1</b>'+
							'</span>'+
						 '</td>'+
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
			var durationBar = $("#qt-duration");
			playVerse(getQiratPlayUrl(verseKey), verseKey, function(msg, data){
				if(msg == "progress"){
					if(data && data.ct)
						durationBar.attr('value', data.ct);
				}
				else if(msg === "loadeddata"){
					if(data){
						durationBar.attr('max', data.duration);
						durationBar.attr('value', data.ct);
						durationBar.css('display', 'block');
					}
				}
				else if(msg === "ended"){					
					durationBar.hide();
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

function openQuranPdf(url){
	
	var w= parent? parent.window:window;
	w.open(url,'_blank');
	return false;
	
	//if(parent && parent.openInline){
	//	parent.openInline(url);
	//}		
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
		var durationBar = $("#qt-duration");
		parent.playAudio(url2, function(action, data){
			
			if(action == "loadstart"){
				durationBar.attr('value',0);
			}
			else if(action == "progress"){
				if(data && data.ct)
					durationBar.attr('value', data.ct);
			}
			else if(action == "loadeddata"){
				if(data){
					durationBar.attr('max', data.duration);
					durationBar.attr('value', data.ct);
					durationBar.css('display', 'block');
				}
			}
			else  if(action == "pause" || action == "ended"){
				togglePlayButtons(verseKey, "visisble", "collapse");
				durationBar.hide();
			}
			
			if (cb) cb(action, data);
		});
		
		togglePlayButtons(verseKey, "collapse", "visisble");
	}
}

function stopPlayVerse(){	
	$("#qt-duration").hide();
	if(parent && parent.stopAudio){
		parent.stopAudio();
	}
}

function selectSurahCell(tdElem, state){
	var elem = tdElem.parent().find('td:first');
	if(elem.length > 0){
		if(state)
			elem.addClass('qword-selected');
		else
			elem.removeClass('qword-selected');
	}
}

function toggleQHead(){
	if($("#imgQHead").prop('src').endsWith("up.png")){
		$("#imgQHead").prop('src', 'images/dn.png');
		$("#divQHead").hide();
	}
	else{
		$("#imgQHead").prop('src', 'images/up.png');
		$("#divQHead").show();
	}
}

function toggleQuranView(readView){
	if(readView){
		$("#qv1").hide();
		$("#qv2").show();
		$("#qv2").parent().find("input[type='checkbox']").parent().hide();
		$("#juz-options").hide();
		$("#surah-options").show();
		$("#page-options").show();
		$("#tqv1").hide();
		$("#tqv2").show();
		$("#juz-options").prev().css('color','crimson');
		$("#juz-options").next().next().css('color','crimson');
		$("#juz").children().last().show();
		displayQPage();
	}else{
		$("#qv2").hide();
		$("#qv1").show();		
		$("#qv2").parent().find("input[type='checkbox']").parent().show();
		$("#juz-options").show();
		$("#surah-options").hide();
		$("#page-options").hide();
		$("#tqv1").show();
		$("#tqv2").hide();
		$("#juz-options").prev().css('color','transparent');
		$("#juz-options").next().next().css('color','transparent');
		$("#juz").children().last().hide();
	}
}

function displayQPage(){
	var pg = $("#page-options").val().replace('page','');
	if(pg.length < 2) pg = '0'+pg;
	if(pg.length < 3) pg = '0'+pg;
	var img = $("#tqv2 img").first();
	var imgLoading = $("#tqv2 img").last();
	
	imgLoading.show();
	img.on('load', function(){
		imgLoading.hide();
	});
	img.attr('src', 'https://archive.org/download/ALQURANPERPAGEFORMATPNG/page'+pg+'.png');
	
	//update surah
	var index;
	Object.keys(surah_list).every(function(k){
		var v = surah_list[k];
		var p1 = v.pages;
		var p2 = p1;
		if(v.pages.includes('-')){
			var pages = v.pages.split('-');
			p1 = parseInt(pages[0]);
			p2 = parseInt(pages[1]);
		}else{
			p1 = parseInt(v.pages);
			p2 = p1;
		}
		
		var val = parseInt(pg);
		if(val >= p1 && val <= p2){
			index = k;
			return false;
		}
		return true;
	});
	if(index){
		$("#surah-options").val(index);
	}
}

function onDurationClick(id, e){
	var prog = $(id);
	var max = prog.width(); //Get width element
    var pos = e.pageX - prog.offset().left; //Position cursor
    var perc = pos / max;
	if(perc > 1) perc = 1;
	var value = Math.round(prog.attr('max') * perc)
    //console.log('range at: ' + value);
	if(parent && parent.changeAudioTime){
		parent.changeAudioTime(null, value);
	}
}