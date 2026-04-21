//
//	Author: munawwar_ali@yahoo.com
//

var lang = "ar";
var lastSuggestionInput = undefined;
var qf_list = [];
var q_summary = {};
var loadStatus;
var isAutoPlayQirat, changeQari;
var q_app_mode = 'default';
var page_layout_size=1;
var tafsir_param;
var surah_list;

window.onload = function(){
	
	$("#hd-loading").show();
	$("#searchText").keyup(function(event) {
		if (event.keyCode === 13) {
			$("#SearchQ").click();
		}
	});
	
	if(isOS('Android')){
		$("img[src='images/kybd.jpg']").hide();
	}

	ensureJsonData({name:"similarAyahData"});
	
	//Fill Juz select options
	var jOptions = $("#juz-options");
	for(var j=1; j <31; j++){
		jOptions.append($(`<option value="juz${j}">Juz ${j}</option>`));
	}
	
	//Fill Page select options
	var pOptions = $("#page-options");
	for(var j=1; j <605; j++){
		pOptions.append($(`<option value="page${j}">Page ${j}</option>`));
	}
	
	window.addEventListener("contextmenu", e =>
	{
	  e.preventDefault();
	});
	
	q_app_mode = getParamValue("mode");
	if(q_app_mode === 'Quran'){
		$("button[title]").hide();
		autoplay = true;
	}
	
	var langParam = decodeURI(getParamValue("lang"));
	if(langParam && langParam != 'undefined' && ( langParam ==='ar' || langParam ==='ur' || langParam ==='en') ){
		lang = langParam;
	}
	
	tafsir_param = decodeURI(getParamValue("tf"));
	if(tafsir_param !== undefined && tafsir_param !== ''){
		$("#tafsir-options").val(tafsir_param);
	}
	
	var searchVal = decodeURI(getParamValue("search"));	
	if(searchVal && searchVal != 'undefined'){
		if(searchVal === 'surahs' || searchVal === 'mushaf' ){
			listSurahs();
			loadStatus = searchVal; //"surahs";
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
async function loadQList(){
	$("#hd-loading").show();
	ensureJsonData({ name: "qfllistData" }).then((data) => {
		loadWordsFrom(data);
		$("#hd-loading").hide();
	});		
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

var last_verse_trans_langs = [];
/* 
Search Quran using QuranJS API  
*/
function search(pageNumber){
	$("#divOntology").hide();
	$("#searchView").hide();
	$("#mushafView").hide();
	$('#qv1').css('background-color','#04AA6D');
	$('#qv2').css('background-color','#04AA6D');
	
	togglePlayControls(false);
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
	else if(text.trim().match(/^\d{1,3}$/g)){
		ctx = window.QuranJS.Verses.findByPage;
		opt = { words: 1};
	}
	
	div.html('Searching '+text+' in the Quran...');
	SearchQuran(ctx, opt, text)
	.then((dataRes) => {
		var data = Array.isArray(dataRes) ? dataRes[0] : dataRes;
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
	
			var verseKey = text.includes(":") ?  text.trim() : data.verseKey;
			var keys = verseKey.split(":");
			var verseNumber = parseInt(keys[1]);
			div.html('');
			
			// Add Next & Prev navigation for single verse
			var nav = `
			<div style="font-size:12px;margin-bottom:10px;padding:10px;background-color:#9DBF6C;">
				${ (verseNumber > 1) ?
					`<span onclick="searchText('${keys[0]}:${verseNumber-1}');"
								style="cursor:pointer;margin-right:20px;">
								<b>&lt;&nbsp;Prev</b>
					</span>
					<span>&nbsp;&nbsp;</span>`:''
				}
				<span>
					<input id="chkTafsir" style="border: 4px solid #8585D4;" type="Checkbox"
						onclick="playTafsir('${verseKey}')">
						&nbsp;Tafsir&nbsp;
					<input id="chkQir" style="border: 4px solid #8585D4;" type="Checkbox"
					${isAutoPlayQirat ? 'checked': ''}
					onclick="onVerseLoaded('${keys[0]}',${verseNumber});">
					&nbsp;Qirat&nbsp;
				</span>
				<span onclick="searchText('${keys[0]}:${verseNumber + 1}');"
					style="cursor:pointer;margin-left:20px;">
					<b>Next&nbsp;&gt;</b>
				</span>
						
				<!-- >Share external -->
				<img src="images/share.png" title="Share"
					style="cursor:pointer;float:right;margin-right:8px;height:20px;"
					onclick="const p=['
								mode='${q_app_mode}',
								search=$('#searchText').val(),
								tf=$('#tafsir-options').val()
							];
							shareExternal(p[1], p);"
				</img>

				<!-- Copy -->
				<span class="dropdown" style="cursor:pointer;float:right;margin-right:8px;">
					<img src="images/copy.png" title="Copy"
						style="height:20px;margin-top:1px;" onclick="" />
			
					<div class="dropdown-content" style="margin-left:-60px;width:10px;">
						<a href="#" onclick="copyAyahText('word-ar');">Copy AR</a>
						<a href="#" onclick="copyAyahText('word-en');">Copy EN</a>
						<a href="#" onclick="copyAyahText('word-ur');">Copy UR</a>
						<a href="#" onclick="copyAyahText('word-hi');">Copy HI</a>
						<a href="#" onclick="copyTafsirText();">Copy تفسير</a>
						<a href="#" onclick="copyAyahMp3Path();">MP3 Path</a>
						<a href="#" onclick="copyAyahImagePath();">Image path</a>
					</div>
				</span>

				<!-- Export Icon -->
				<span style="cursor:pointer;float:right;margin-right:8px;">
					<img src="images/exp.png" title="Export to PDF"
						style="height:20px;margin-top:1px;" 
						onclick="convertHTMLtoImage( '#searchResult', 
							[], 'exported_${keys[0]}_${keys[1]}.pdf'
						);" />
				</span>
			</div>`;
			div.append($(nav));
			onVerseLoaded(keys[0], verseNumber);
			
			// Search the key and get exact verse
			searchVerseKey(1, ayahText, verseKey)
			.then((data2) => {
				data2.results.forEach((res2) => {
					var resulText = res2.highlighted ?? res2.text;
					if(resulText){
						var verse2 = resulText.replace(/[<>\/a-zA-Z]+/ig, '');
						if(res2.verseKey == verseKey){
							displayVerse(
								div, 
								verse2, 
								verseKey, 
								{ 
									words: res2.words, 
									controls: true, 
									direction: 'rtl',
									translateLink: true, 
									ayahOption: $("#ayah-options").val() 
								}
							);

							// Try to get transliteration
							getAyahTransliteration(verseKey, (transData) => {
								
								displayVerse(
									div, 
									transData.join(' '), 
									verseKey, 
									{
										words: transData.map(function(d) {return {text: d} }),
										bgColor: '#F6F0c2',
										direction: 'ltr'
									}
								);								
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
		var nav = `
		<div style="font-size:12px;margin-bottom:10px;padding:10px;background-color:#9DBF6C;">
			${(data.currentPage > 1 ?
				`<span onclick="search(${(data.currentPage - 1)})" style="cursor:pointer;margin-right:20px;">
						<b>&lt;&nbsp;Prev</b>
				 </span>` : '')
			}
			<span>${data.currentPage} of ${data.totalPages}<span>
			${(data.currentPage < data.totalPages ?
				`<span onclick="search(${(data.currentPage + 1)})" style="cursor:pointer;margin-left:20px;">
				  <b>Next&nbsp;&gt;</b>
				 </span>` : '')
			}
			<!-- Export Icon -->
			<span style="cursor:pointer;float:right;margin-right:8px;">
				<img src="images/exp.png" title="Export to PDF"
					style="height:20px;margin-top:1px;" 
					onclick="convertHTMLtoImage('#searchResult', ['#searchResult div'], 'exported_${data.currentPage}.pdf');" />
			</span>
		</div>`;
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

function SearchQuran(ctx, opt, text){
	 return ctx(text, opt)
        .catch(error => {
            console.error("Quran search error:", error);
            throw error; // Re-throw to allow the caller to handle it
        });
}

function searchVerseKey(page, ayahText, verseKey){
	togglePlayControls(false);
	return new Promise((resolve, reject) => {
		SearchQuran(
			window.QuranJS.Search.search, 
			{ 
				language: window.QuranJS.Language.ENGLISH, 
				size: 50,
				page: page		
			}, 	
			ayahText
		)
		.then( async (data) => {
				var res = data.results.filter(x => x.verseKey === verseKey);
				if(res.length > 0){
					resolve(data);
				}
				else if(data.currentPage < data.totalPages){
					try{
						const nextData = searchVerseKey(data.currentPage+1, ayahText, verseKey);
						resolve(nextData);
					}catch(err){
						reject(err)
					}
				}
				else{
          			reject(new Error("Verse key not found."));
				}
			}
		);
	});
}

function changeTafsir(){
	stopPlayVerse();
	$("#chkTafsir").prop('checked', '')

	const text = arRemovePunct(document.getElementById("searchText").value);
	if(text.trim().match(/^\d{1,3}\:\d{1,3}$/g)){
		var verse = text.trim().split(":");
		var divTafsir = $(`#div${verse[0]}_${verse[1]}`);
		if(divTafsir.length > 0){
			var isTafsirEnabled = $("#chkTafsir").prop('checked');
			$(`#${divTafsir[0].id}_tafsir`).html('');

			if($("#tafsir-options").val() !== "none"){
				getVerseTafsir(divTafsir[0].id, text);
			}
		}
	}
	else {
		// when searched by page
		if(text.trim().match(/^\d{1,3}$/g)){
			var div = $(`a:contains("Research")`);
			if(div){
				div.trigger('click');
			}
		}
	}
}

//https://github.com/spa5k/tafsir_api
function getVerseTafsir(id, verseKey){

	var container = $("#searchResult");
	var alink = $("#"+id+'_t');
	alink.addClass('blink');
	var scrollPosition = $(window).scrollTop();
	
	var tafsir = $("#tafsir-options").val();	
	if(tafsir === null || tafsir === "none"){
		return;
	}
	var style = tafsir.startsWith("ur-") ? " font-size:18px;":" font-size:16px;";
	var vKey = verseKey.split(":");
	var url = "https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/"+tafsir+"/"+vKey[0]+"/"+vKey[1]+".json";
	loadJsonData(url).then((data) => {
				
		var childId = id+'_tafsir';
		var elem = document.getElementById(childId); 
		if(elem)
			elem.parentNode.removeChild(elem);

		container.append($('<div id="'+childId+'" style="'+style+'padding-top:14px;">'+data.text+'</div>'));
		
		alink.removeClass('blink');
		$(window).scrollTop(scrollPosition);
	});
}

function getVerseTranslation(dataAttr, id, verseKey, sfx = '_en', lang = window.QuranJS.Language.ENGLISH){

	var id2 = id.replace('div','vdiv-')
	           .replace('_', '-');
	var div = $("div#"+id2).last();
	var alink = $("#"+id+sfx);
	alink.addClass('blink');
	SearchQuran(window.QuranJS.Verses.findByKey, { 
				words: 1, 
				language:  lang
			}, 
			verseKey
	)
	.then((data) => {	
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
			
			//remove previous translation if exists
			if(dataAttr){
				var prevDiv = $(`#vdiv-${verseKey.replace(':', '-')}[data='${dataAttr}']`);
				if(prevDiv.length > 0){
					prevDiv.remove();
				}
			}

			// add last trans lang
			if(last_verse_trans_langs.indexOf(lang) === -1){
				last_verse_trans_langs.push(lang);
			}
			displayVerse(div, ayahText, verseKey, { 
				words: data.words,
				bgColor: sfx === '_en' ? '#F6F0F2' : '#E8EEF4',
				keepFocus: true,
				dataAttr: dataAttr,
				direction: (sfx === '_ar' || sfx === '_ur') ? 'rtl' : 'ltr'
			});
			
			var scrollPosition = $(div).offset().top; // ?? $(window).scrollTop();
			alink.remove();
			$(window).scrollTop(scrollPosition);
		}
	});
}

function getTranslationLinks(transLinkId, verseKey){
	return `<span class="dropdown">
				<button style="padding:0; border-style:hidden;margin-left:8px;cursor:pointer;font-size:16px;"
					title="Click to see translation">&#x24c9;</button><!--Ⓣ-->
				<div class="dropdown-content">
					<a 	id="${transLinkId}_en" href="#"
						onclick="getVerseTranslation('en', '${transLinkId}', '${verseKey}','_en');">
						English
					</a>
					<a id="${transLinkId}_ur" href="#"
						onclick="getVerseTranslation('ur', '${transLinkId}', '${verseKey}', '_ur', window.QuranJS.Language.URDU);">
						Urdu
					</a>
					<a id="${transLinkId}_hi" href="#"
						onclick="getVerseTranslation('hi', '${transLinkId}', '${verseKey}', '_hi', window.QuranJS.Language.HINDI);">
						Hindi
					</a>
					<a 	id="${transLinkId}_t" href="#"
						onclick="getVerseTafsir('${transLinkId}', '${verseKey}');">
						Tafsir
					</a>
				</div>
			</span><br/>`;
}

function displayVerse(div, verse, verseKey, options){
	var verseKeys = verseKey.split(":");
	var playOptions = getPlayOptions(verseKey, verseKeys);
	var analysisOptions = getAnalysisOptions(verse, verseKeys);
	var verseLinkOptions = getVerseLinkOptions(verseKey);
					 
	var transLinkId = 'div'+verseKeys[0]+'_'+verseKeys[1];
	var translationLink = getTranslationLinks(transLinkId, verseKey);
	
	var bgColor = options.bgColor ? 'background-color:'+options.bgColor+';' : '';
	var direction =  options.direction ? 'direction:'+options.direction+';' :
						verse.match(/^[\x00-\x7F]+/g) ? '' : 'direction:rtl;';
	var divHtml = `
		<span style="display:block;padding-top:14px;"></span>
		<div 
			id="vdiv-${verseKeys[0]}-${verseKeys[1]}" 
			${options.dataAttr ? `data=${options.dataAttr}`:''} 
			style="padding-bottom:4px;font-size:22px;display:inline;align-items:center;justify-content:center;${direction+bgColor}">
			${
				(options.ayahOption === "image") ?
					`<img style="padding:4px;max-width:96%" 
						src="https://everyayah.com/data/images_png/${verseKeys[0]}_${verseKeys[1]}.png" />`
				:
				getWordSpans(verse, options ? options.words: undefined, verseKeys[0]+verseKeys[1])
			}
		</div>`;
	
	divHtml += `<div style="font-size:14px;padding-bottom:12px;" id="${transLinkId}">`;
	var surah_index = parseInt(verseKeys[0]);
	divHtml += (options == undefined || options.controls) ?
	`
	    <span style="padding-right:8px;">${analysisOptions}</span>
	    <span style="padding-right:8px;">${playOptions}</span>
	    <span style="margin:auto;">${verseLinkOptions}</span>
	    ${
			(surah_list ? 
			`<span 	onclick="loadSurahFromPage(${surah_index},'${surah_list[surah_index].pages}');"
					style="margin:auto;font-size:14px;margin-left:6px;color:#49348D;cursor:pointer;">
				'<b>${surah_list[surah_index].ar}</b>
			</span>` : '')
		}
		${
			((options.translateLink) ? `<span>${translationLink}</span>`:'')
		}
	`:'';
	divHtml += '</div>';
	div.append($(divHtml));
	
	if(options.keepFocus){
		var elem = $("#vdiv-"+verseKeys[0]+'-'+verseKeys[1]);
		if(elem.length > 0){
			elem[0].scrollIntoView({
				behavior: 'smooth', 
				block: 'start', 
				inline: 'nearest'
			});
		}
	}
}

function selectWordInAyah(id) {
    const langs = ['en', 'ur', 'hi'];
    
    // Normalize ID by removing any language suffix
    const baseId = id.replace(/-(en|ur|hi)$/, '');

    // Reset all highlights in one go
    $(".word-ar, .word-en, .word-ur, .word-hi")
	.removeClass("sel-word sel-word-en sel-word-ur sel-word-hi");

    // Apply new highlights
    $(`[id='${baseId}']`).addClass("sel-word");
	//$("#"+id).addClass("sel-word");	 // only
    langs.forEach(lang => {
        $(`#${baseId}-${lang}`).addClass(`sel-word-${lang}`);
    });
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
			vSpans += `
			<span 	id="${id}" class="${wClass}" onclick="selectWordInAyah(this.id)">
			${word}
			</span>&nbsp;`;
		});
		return vSpans;
	}
	return verse;
}

function getPlayOptions(verseKey, verseKeys){
	var spanId = verseKeys[0]+"_"+verseKeys[1];
	var play = parent.playAudio ? `
		<span id="${spanId}">
			<img 	title="Play Qirat" 
					src="images/speech-enabled.png" 
					style="visibility:visible;width:20px;cursor: pointer;"
					onclick="playVerse('${getQiratPlayUrl(verseKey)}','${verseKey}')"/>
			<img 	title="Stop" 
					src="images/stop.png" 
					style="visibility:hidden;width:0px;cursor: pointer;"
					onclick="stopPlayVerse()"/>
		</span>`:'';
  return play;
}

function reloadVerse(verseKey){
	$("#searchText").val(verseKey);
	search();
}

function getReferences(){
	var txt = $(".sel-word")[0].innerText; // choose the arabic part (not transliteration)
	var word = removePunctuations(txt).trim(); 
	if(word !== ""){
		$("#searchText").val(word);
		search();
	}
}

function getSimilarAyahReferences(verseKey){
	var ayah = [];
	var similar_ayah = parent.dataCache["similarAyahData"].data;
	if(similar_ayah){
		if(similar_ayah[verseKey]){
			similar_ayah[verseKey].every(function(entry){
				ayah.push(entry.matched_ayah_key);
				return true;
			});
		}
		else{
			var searchDict = Object.entries(similar_ayah).filter(([id, entry]) =>  entry.some((v) => v.matched_ayah_key === verseKey));
			if(searchDict){
				Object.keys(searchDict).every(function(key){
					ayah.push(searchDict[key][0]);
					return true;
				});
			}	
		}
	}
	else{
		return "";
	}
	return ayah.map((a) => `
		<a 	href="#" title="See Also" 
			onclick="reloadVerse('${a}')">See also ${a}</a>`)
		.join('');
}

function getVerseLinkOptions(verseKey){
	
	return `
		<span>
			<span class="dropdown">
				<button class="dropbtn" style="background-color:#EEEEEE;color:black;">
					[${verseKey}]
				</button>
				<div class="dropdown-content">
					${getSimilarAyahReferences(verseKey)}
					<a 	href="#" 
						title="Reload verse" 
						onclick="reloadVerse('${verseKey}')">Research</a>
					<a 	title="Click to view in tanzil.com"
						href="https://tanzil.net/#${verseKey}"
						onclick="
							var w = parent.window ? parent.window : window; 
							w.open(this.href, '_blank'); 
							return false;">
						tanzil.net
					</a>
				</div>
			</span>
		</span>
	`;
}

function getAnalysisOptions(verse, verseKeys){
	return `<span>
				<span class="dropdown">
					<button class="dropbtn" title="Select a word to analyze"
						style="width:20px;
						background: url(images/analyze.jpg);
						background-repeat: no-repeat;
						background-size: 20px 20px;">
					معني
					</button>
					<div class="dropdown-content">
						<a href="#" onclick="getReferences()">References</a>
						<!--//
						${
							q_app_mode === 'Quran' ? '' :
							'<a href="#" onclick="analyzeLocal()" >Analyze (تحليل)</a>'
						}
						//-->
						<!-- Google AI Search -->
						<div class="dropdown-content dropdown2" 
						     style="position:relative;padding-top:10px;padding-bottom:10px;vertical-align:middle;">
							 <img style="margin:auto;width:18px;" src="images/ai.png" alt="Powered by Puter"/>
							 &nbsp; Google &gt;
						</div> 
						<div class="dropdown-content2" style="z-index:999999;margin-left:60px;padding:2px;">
						${	
							getPromptsForVerse(verseKeys[0], verseKeys[1], $('sel-word').length > 0 ? $('sel-word')[0].text : '', 'google')
						}
						</div>

						<div class="dropdown-content dropdown2" 
						     style="position:relative;padding-top:10px;padding-bottom:10px;">Meaning &gt;</div> 
						<div class="dropdown-content2" style="margin-left:60px;padding:2px;">
							<a href="#" onclick="analyzeSelection(${verseKeys[0]},${verseKeys[1]})">
							<sub>Analyze (المعاني)</sub>
							</a>
							<a href="#" onclick="analyzeLookup('https://www.almaany.com/ar/dict/ar-$/')">
							<sub>Meaning (المعاني)</sub>
							</a>
							<a href="#" onclick="analyzeLookup('https://context.reverso.net/translation/arabic-english/')">
							<sub>Meaning (Reverso)</sub>
							</a>
							<a href="#" onclick="analyzeLookup('https://glosbe.com/ar/$/')">
							<sub>Meaning (Glosbe)</sub>
							</a>
						</div>
				</div>
			</span>'+
		</span>`;
}

function analyzeLookup(url){
	let selElem = $(".sel-word")[0];
	lookupEx(
		url, 
		selElem ? selElem.innerText.trim() : '', 
		"Select a word (from the ayah)!"
	);
}

function analyzeSelection(surah, verse){
	let wordElem = $(".sel-word");
	let selectedWord = wordElem[0].innerText.trim();
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

/*
Loads all words from the Quran
*/
function listWordInfo(filter){
	$("#juz").hide();
	$("#qari").hide();
	if(qf_list && qf_list.length > 0){
		var div = $("#searchResult");
		div.empty();
		var credit = `
		<div class="credit">source: 
		    <a href="#" onclick="window.open('${q_summary.credit}', '_blank')">
			${q_summary.credit}
			</a>
		<div>`;
		var table = '<table class="wordIndex"><th>Frequency</th><th>PoS</th><th>Word</th>';
		qf_list.forEach(function(data) {
			var alink = `
			<p style="cursor:pointer;" 
			   onclick="selectWordAndSearchInQuran('${data.word}')">
				${data.word}
			</p>`;
				
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

function updatePage(s, p){
	if(s){
		$("#surah-options").val(s);
	}
	var s = s ?? $("#surah-options").val().replace('s','');
	var entry = surah_list[s];
	var page = p ?? (entry.pages.includes('-') ? entry.pages.split('-')[0] : entry.pages);
	$("#page-options").val('page'+page);
	displayQPage(p);
}

var page_nav;
function switchPage(position){
	if(page_layout_size > 1){
		sel = $("#page-options");
		if(sel.is(':visible')){
			var opt = sel.val();
			var value = parseInt(opt.replace('page',''))
			if(value % 2 !== position){
				if(position == 0)
					navigatePage(true);
				else
					navigatePage(false);
			}
		}
	}
}

function navigatePage(next, gap=1, page){
	sel = $("#page-options");
	if(sel.is(':visible')){
		var value = page ?? parseInt(sel.val().replace('page',''))
		value += next ? +gap:-gap;
		page_nav = next ? +gap:-gap;
		if(value > 0 && value < 605){
			sel.val('page'+value);
			displayQPage();
			return true;
		}
	}
	return false
}

var manzilPages = [1, 107, 208, 282, 367, 446, 518, 1000];
var sajdaPages = [176, 251, 271, 293, 309, 334, 365, 379, 416, 454, 480, 528, 589, 597, 1000];
var juzPages = [1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582,605];

function updateRukuNumber(page){
	var sel = $("#page-options");
	var pg = page ?? parseInt(sel.val().replace('page',''));
	loadJsonData(`https://api.quranhub.com/v1/page/${pg}`).then((res) => {
		var rukuNumbers = res.data.ayahs.map(a => a.ruku);
		var rukuNumber = rukuNumbers.filter((value, index) => {
		  return rukuNumbers.indexOf(value) === index;
		});
		$("#rukuNumber").html("Ruku (" + rukuNumber.join() + ")");
	});
}

function updateManzilNumber(page){
	var sel = $("#page-options");
	var pg = page ?? parseInt(sel.val().replace('page',''));
	var nextManzil = manzilPages.filter(function(p){ if(pg < p) return p;})[0];
	var manzilNumber = manzilPages.indexOf(nextManzil);
	$("#manzilNumber").html(manzilNumber + " منـزل ");
	$("#manzilNumber").attr("data-value", manzilNumber);
}

function updateJuzNumber(page){
	var sel = $("#page-options");
	var pg = page ?? parseInt(sel.val().replace('page',''));
	var nextJuz = juzPages.filter(function(p){ if(pg < p) return p;})[0];
	var juzNumber = juzPages.indexOf(nextJuz);
	$("#juzNumber").html("Juz "+ juzNumber);
	$("#juzNumber").attr("data-value", juzNumber);
}

function navigateManzil(next){
	sel = $("#page-options");
	if(sel.is(':visible')){
		var pg = parseInt(sel.val().replace('page',''));
		var nextAyah = manzilPages.filter(function(p){ if(next) {if(pg < p) return p;} else if(pg <= p) return p;})[0];
		var index = manzilPages.indexOf(nextAyah);
		if(next && nextAyah < 1000)
			navigatePage(next, 0, manzilPages[index]);
		if(!next && index > 0)
			navigatePage(next,  0, manzilPages[index-1]);
	}
}

function navigateAyahSajda(next){
	sel = $("#page-options");
	if(sel.is(':visible')){
		var pg = parseInt(sel.val().replace('page',''));
		var nextAyah = sajdaPages.filter(function(p){ if(next) {if(pg < p) return p;} else if(pg <= p) return p;})[0];
		var index = sajdaPages.indexOf(nextAyah);
		if(next && nextAyah < 1000)
			navigatePage(next, 0, sajdaPages[index]);
		if(!next && index > 0)
			navigatePage(next,  0, sajdaPages[index-1]);
	}
}

function navigateJuz(next){
	sel = $("#page-options");
	if(sel.is(':visible')){
		var juz = parseInt($("#juzNumber").attr("data-value"));
		if(next && juz < 30)
			navigatePage(next, 0, juzPages[juz]);
		else if(!next && juz > 1)
			navigatePage(next,  0, juzPages[juz-2]);
	}
	else{
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
	}
}

function filterSurahs(elem, cname){
	var manzil = $("#manzil").attr('data-value');
	var opt = cname ?? $("#juz-options").val();
	if(opt === "all"){
		$(".surahIndex [class^=\'juz\']").show();
		if(elem){
			$(elem).prev().css('color','transparent');
			$(elem).next().css('color','transparent');
		}
	}else{
		$(".surahIndex [class^=\'juz\']").hide();
		$(".qword-selected").parent().show();
		$("."+opt).show();
		if(elem){
			$(elem).prev().css('color','crimson');
			$(elem).next().css('color','crimson');
		}
	}
	filterManzil($("#manzil").attr('data-value'));
}

function filterManzil(val, opt){

	var juz = $('#juz-options').val();
    var mz = val;
	if (juz === undefined || juz !== "all") {
		mz = "manzil";
		if(surah_list){
			var juzVal = parseInt(juz.replace("juz",""));
			const filteredDictionary = Object.fromEntries(
			  Object.entries(surah_list).filter(([id, surah]) =>  surah.juz.includes(juzVal))
			);
			if(filteredDictionary){
				const firstKey = Object.keys(filteredDictionary)[0];
				const firstValue = filteredDictionary[firstKey];
				mz = "mz"+firstValue.manzil;
			}
		}
	}
	juz = (juz === undefined || juz === "all") ? " [class^='juz']": "."+juz;
	
	$("#manzil").attr('src','data/qrn/mz/'+mz+'.jpg');
	$("#manzil").attr('data-value', mz);
	$("#manzil").next().hide();
	
	var huruf = (opt === undefined) ? "all" : opt;
	$("#huruf").attr('data-value', huruf);
	
	var mm = $("#qMM").attr('data-value');
	var elems = $('.surahIndex'+juz);
	for(var i=0; i < elems.length; i++){
		var elem = $(elems[i]);
		if( (val === "manzil" || elem.hasClass(val)) && (mm === "makki.madni" || elem.hasClass(mm))){
			if(huruf === "all" || elem.hasClass(huruf))
				elem.show();
			else
				elem.hide();
		}
		else
			elem.hide();
	}
}

function filterHuruf(val){
	$("#huruf").attr('data-value', val);
	filterManzil($("#manzil").attr('data-value'), val);
}

/*
Loads Quran surah index
*/
var surah_order = false, surah_disp_mode='table';
function listSurahs(loadMushaf, index, page){
	$("#qari").hide();
	ensureJsonData({name: 'qsurahData', file: 'qsurah.json'})
	.then((data) => {	
		if(data){
			//Load Topicsa
			setTimeout(loadQuranTopics, 40);
		}

		surah_list = data;
		var div = $("#searchResult");
		div.empty();		
		if(surah_disp_mode === 'table')
			createTableView(data, div);
		else
			createGridView(data, div);

		if(loadMushaf !== undefined || loadStatus === 'mushaf'){
			toggleQuranView(true, index, page);
			loadStatus = "surahs";
		}else{
			toggleQuranView(false, index, page);
		}
		
		//toggle columns
		var checkboxes = $("#eye input[type='checkbox']");
		checkboxes.each(function(index, chk){
			if($(chk).is(":checked") == false){
				if(index == 0) $('.chkR').toggle();
				else 
				if(index == 1) $('.chkT').toggle();
				else
				if(index == 2) $('.chkQ').toggle()
			}
		});
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
			var durationVal = $("#qt-value")
			playVerse(getQiratPlayUrl(verseKey), verseKey, function(msg, data){
				if(msg == "progress"){
					if(data && data.ct)
						durationBar.attr('value', data.ct);
						durationVal.html(getDurationString(data.ct));
				}
				else if(msg === "loadeddata"){
					if(data){
						durationBar.attr('max', data.duration);
						durationBar.attr('value', data.ct);
						durationVal.html(getDurationString(data.ct));
						//durationBar.parent().css('display', 'inline-block');
						togglePlayControls(true);
					}
				}
				else if(msg === "ended"){					
					//durationBar.parent().hide();
					togglePlayControls(false);
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

	if (last_verse_trans_langs) {
		last_verse_trans_langs.forEach(function (lang) {
			var vKey = `${chapter}:${verse}`;
			var vId = `div${chapter}_${verse}`;
			setTimeout(function () {
				getVerseTranslation(lang, vId, vKey, '_' + lang,
					(lang === 'ur') ?
						window.QuranJS.Language.URDU :
						(lang === 'hi') ?
							window.QuranJS.Language.HINDI :
							window.QuranJS.Language.ENGLISH
				);
			}, 100);
		});
	}
	if ($("#tafsir-options").val() !== "none") {
		setTimeout(function () {
			changeTafsir();
		}, 300);
	}
}

function searchText(txt){
	$("#divOntology").hide();
	$('#qv1').css('background-color','#04AA6D');
	$('#qv2').css('background-color','#04AA6D');
	$("#searchText").val(txt);
	search();
}

function handler_AutoSearchClick(e) {
	if ($("#eye").is(':visible') && e.data && e.data.includes('|')) {
		var ayah = e.data.split("|")[1];
		searchText(ayah);
		$("#topicSearchText").blur();
	}
}
function loadQuranTopics(){
	
	document.removeEventListener("autosearch-click", handler_AutoSearchClick);
	document.addEventListener("autosearch-click", handler_AutoSearchClick);
			  
	autocomplete(document.getElementById("topicSearchText"), function(val, callback){
		var condition = val.length > 1 && val !== lastSuggestionInput;
		if(val.length > 1 && val !== lastSuggestionInput){
			getTopicSuggesstions(val, callback);
		}
		return condition;
	});
}

async function  getTopicSuggesstions(val, callback){
	var suggesstions = [];
	for(const [key, value] of Object.entries(parent.dataCache["qsurahData"].data)){
		if(value.topics !== undefined){
			var topics = value.topics.map(function(t){
				if(t.toLowerCase().includes(val.toLowerCase())){
					var l = t.replace(/\|(\d+)$/g, "|"+key+":$1");
					suggesstions.push(l);
				}
			});
		}
	}
	callback(suggesstions);
}
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

function openQuranPdf(url){
	
	var w= parent? parent.window:window;
	w.open(url,'_blank');
	return false;
	
	//if(parent && parent.openInline){
	//	parent.openInline(url);
	//}		
}

function selectSurahCell(tdElem, state){
	var elem = tdElem.parent().find('td');//.find('td:first');
	if(elem.length > 0){
		if(state){
			elem.addClass('qword-selected');
			elem.first().find('.navUp').show();
			$(".navDn").show();
		}
		else {
			elem.removeClass('qword-selected');
			elem.first().find('.navUp').hide();
			$(".navDn").hide();
		}
	}
}

function loadSurahFromPage(surah, pageRange){
	var pg = pageRange.split("-")[0];
	listSurahs(true, surah, pg);
}

function toggleQuranView(readView, index, page){
	if(readView){
		$('#qv1').css('background-color','#04AA6D');
		$('#qv2').css('background-color','darkolivegreen');
		$("#searchView").css('display', 'none');
		$("#mushafView").css('display', 'flex');
		$("#tqv1").hide();
		$("#tqv2").css('display', 'flex');
		
		if(index && page)
			updatePage(index, page);
		else
			displayQPage();
		changeDisplayLayout();
	}else{
		$('#qv1').css('background-color','darkolivegreen');
		$('#qv2').css('background-color','#04AA6D');
		$("#searchView").css('display', 'block');
		$("#mushafView").css('display', 'none');
		$("#tqv1").show();
		$("#tqv2").hide();
	}
}

function displayQPage(p){
	var pg = p ?? $("#page-options").val().replace('page','');
	var pg2 = pg, pVal = parseInt(pg), isPageEven = ( pVal % 2 === 0);
	if(page_layout_size > 1){
		if(isPageEven){ 
			pg2 = (pVal - 1).toString();
		}
		else{
			pg2 = pg;
			pg = (pVal + 1).toString();
		}
	}
	if(pg.length < 2) pg = '0'+pg;
	if(pg.length < 3) pg = '0'+pg;
	if(pg2.length < 2) pg2 = '0'+pg2;
	if(pg2.length < 3) pg2 = '0'+pg2;

	var img = $("#tqv2 img").first();
	var img2 = img.next();
	var imgLoading = $("#tqv2 img").last();
	
	configureSwipeEvents(img[0], function(){
		navigatePage(false, page_layout_size);
	}, function(){
		navigatePage(true, page_layout_size);
	});
	if(page_layout_size > 1){
		configureSwipeEvents(img.next()[0], function(){
			navigatePage(false, page_layout_size);
		}, function(){
			navigatePage(true, page_layout_size);
		});
	}
	
	imgLoading.show();
	$("#tqMessage").hide();
	$("#tqv2").show();
	loadPage(function(){
		showPageEffect();	
		imgLoading.hide();
		
		//udate Juz Number
		updateRukuNumber();
		updateJuzNumber();
		updateManzilNumber();
	}, 
	showMushafLayoutOptions);
	
	function showPageEffect(){
		if(page_layout_size > 1){
			if(page_nav > 1){
				img.addClass("page-turn");
				img2.removeClass("page-turn");
			}
			else if(page_nav < -1)
			{
				img2.addClass("page-turn");
				img.removeClass("page-turn");
			}
			if(isPageEven){
				img.css('border-top', '2px double darkmagenta');
				img2.css('border-top', '');
			}
			else{
				img.css('border-top', '');
				img2.css('border-top', '2px double darkmagenta');
			}
			img.css("width", "50%");
			img2.css("width", "50%");
			img2.show();
			
			setTimeout(function(){
				img.removeClass("page-turn");
				img2.removeClass("page-turn");
			}, 300);
		}
		else{
			img.css('object-position', '');
			img.css('border-top', '');
			img.css("width", "100%");
			img2.hide();
		}
	}
	
	function loadPage (cb, cb_Error){
		img.on('load', cb);
		img.on('error', cb_Error);
		if(page_layout_size > 1) img2.on('error', cb_Error);
		var l = $("#mushaf-layout").attr('data-value').split(",");
		var layout = l[0];
		if(layout === 'uthmani'){
			if(page_layout_size > 1){
				img2.attr('src', 'https://www.searchtruth.com/quran/images/images2/large/page-'+pg2+'.jpeg');
			}
			img.attr('src', 'https://www.searchtruth.com/quran/images/images2/large/page-'+pg+'.jpeg');	
		}
		else if(layout === 'madni'){
			if(page_layout_size > 1){
				img2.attr('src', 'https://ia801807.us.archive.org/BookReader/BookReaderImages.php?zip=/19/items/quran-madinah/quran-madina_jp2.zip&file=quran-madina_jp2/quran-madina_0'+pg2+'.jp2&id=quran-madinah&scale=1&rotate=0');
			}
			img.attr('src', 'https://ia801807.us.archive.org/BookReader/BookReaderImages.php?zip=/19/items/quran-madinah/quran-madina_jp2.zip&file=quran-madina_jp2/quran-madina_0'+pg+'.jp2&id=quran-madinah&scale=1&rotate=0');
		}
		else if(layout === "ksu"){
			if(page_layout_size > 1){
				img2.attr('src', 'https://quran.ksu.edu.sa/ayat/safahat1/'+pg2.replace(/^0+/g,'')+'.png');
			}
			img.attr('src', 'https://quran.ksu.edu.sa/ayat/safahat1/'+pg.replace(/^0+/g,'')+'.png');
		}
		else{
			if(page_layout_size > 1){
				img2.attr('src', 'https://archive.org/download/ALQURANPERPAGEFORMATPNG/page'+pg2+'.png');
			}
			img.attr('src', 'https://archive.org/download/ALQURANPERPAGEFORMATPNG/page'+pg+'.png');
		}
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
		
		$("#page-options").prev().css('color', pg == "001" ? 'transparent': 'crimson');
		$("#page-options").next().css('color', pg == "604" ? 'transparent': 'crimson');
	}
}

function updateLayoutData(l1, l2){
	var el=$('#mushaf-layout'); 
	var d = el.attr('data-value').split(',');
	el.attr('data-value',(l1 ?? d[0])+','+(l2 ?? d[1]))
}

function changeDisplayLayout(layout){
	var img = $("#searchResult img").first();
	var img2 = img.next();
	if(img.length == 0)
		return;
	var l = layout ?? $("#mushaf-layout").attr('data-value').split(",")[1];
	var w = $(window);
	if(img.length > 0){
		if(l === 'h'){
			img.css('object-fit', 'contain');
			img.attr('width', 'auto');
			img.attr('height', w.height() - img.offset().top);
			if(page_layout_size > 1){
				img.css('object-position', 'right top');
				img2.css('object-position', 'left top');
				img2.css('object-fit', 'contain');
				img2.attr('width', 'auto');
				img2.attr('height', w.height() - img2.offset().top);
				img2.attr('top', 0);
			}else{
				img.css('object-position', '');
				img2.css('object-position', '');
			}
			updateLayoutData(undefined, 'h');
		}else {
			img.css('object-fit', 'contain');
			img.attr('width', w.width() / page_layout_size - img.offset().left);
			img.attr('height', 'auto');
			if(page_layout_size > 1){
				img.css('object-position', 'right top');
				img2.css('object-position', 'left top');
				img2.css('object-fit', 'contain');
				img2.attr('width', w.width() / page_layout_size - img2.offset().left);
				img2.attr('height', 'auto');
				img2.attr('top', 0);
			}else{
				img.css('object-position', '');
				img2.css('object-position', '');
			}
			updateLayoutData(undefined, 'w');
		}
	}
}

function changePageLayout(number){
	var img = $("#searchResult img").first();
	if(img.length == 0)
		return;
	page_layout_size = number ;
	if(page_layout_size < 0 || page_layout_size > 2)
		page_layout_size = 1;
	displayQPage();
	setTimeout(changeDisplayLayout, 1);
}

function toggleMakkiMadni(){
	var dv = $("#qMM").attr('data-value');
	if(dv === 'makki.madni'){
		$("#qMM").attr('src','images/makki.jpg');
		$("#qMM").attr('data-value', 'makki');
	}
	else if(dv === 'makki'){
		$("#qMM").attr('src','images/madni.jpg');
		$("#qMM").attr('data-value', 'madni');
	}
	if(dv === 'madni'){
		$("#qMM").attr('src','images/makki.madni.jpg');
		$("#qMM").attr('data-value', 'makki.madni');
	}
	
	filterSurahs($('juz-options'));
}

function getAyahTransliteration(verseKey, cb){	
	ensureJsonData({name:"transliterationData", file: 'en-wbw-ayah.json'})
	.then((data) => {
		if(cb) cb(data[verseKey]);
	});
}

function handleSurahInfoDisplay(elem){
	var el = $(elem);
	var off = el.offset(); 
	if(el.html()==='Urdu'){
		el.html('English');
		el.next().hide();
		el.next().next().show();
	}
	else
	{
		el.html('Urdu');
		el.next().show();
		el.next().next().hide();		
	}
	setTimeout(function(){el[0].scrollIntoView();},50);
}

function showMushafLayoutOptions(){
	$("#tqMessage").html(`
		The mushaf 
		<b>${ $("#mushaf-layout").attr('data-value').split(",")[0] }
		</b> images are currently not available.<br/><br/>
		Try <b>Uthmani</b> or <b>KSU</b> layouts.<br/><br/>
		<table width="70%"><tr><th colspan="2">Available Layouts</th></tr>
		<tr><td>Default</td>
			<td>
				<a href="#" onclick="updateLayoutData('default');displayQPage();">
					<b>Apply</b>
				</a>
			</td>
		</tr>
		<tr><td>Uthmani</td>
			<td>
				<a href="#" 
				onclick="updateLayoutData('uthmani');displayQPage();">
				<b>Apply</b></a>
			</td>
		</tr>
		<tr>
			<td>Madni</td>
			<td>
				<a href="#" onclick="updateLayoutData('madni');displayQPage();">
				<b>Apply</b></a>
			</td>
		</tr>
		<tr>
			<td>KSU</td>
			<td>
				<a href="#" onclick="updateLayoutData('ksu');displayQPage();">
					<b>Apply</b>
				</a>
			</td>
		</tr>
		</table>`);
	$("#tqMessage").show();
	$("#tqv2").hide();
}

function showQuranicSymbols(){
	var trStyle = 'style="vertical-align:top"';
	var tdStyle = 'style="font-size:40px;padding-left:20px;"';
	$("#tqMessage").html(`
	<table style="width:60%;padding:10;margin:auto;text-align:left">
		<tr>
			<th style="width:20%;text-align:left;">Symbol</th>
			<th style="width:80%;text-align:left;">Indication</th>
		</tr>
		<tr ${trStyle}><td ${tdStyle}>ۘ</td><td>must stop</td></tr>
		<tr ${trStyle}><td ${tdStyle}>ۙ</td><td>don\'t stop</td></tr>
		<tr ${trStyle}><td ${tdStyle}>ۚ</td><td>optional to stop</td></tr>
		<tr ${trStyle}><td ${tdStyle}>ۖ</td><td>better to not stop</td></tr>
		<tr ${trStyle}><td ${tdStyle}>ۗ</td><td>better to stop</td></tr>
		<tr ${trStyle}><td ${tdStyle}>ۜ</td><td>little pause</td></tr>
		<tr ${trStyle}><td style="font-size:60px;padding-left:20px;">ۤ
			</td><td>prolong or extend</td>
		</tr>
		<tr ${trStyle}>
			<td style="font-size:70px;padding-left:20px;"><i>ۛ</i>ۛ</td>
			<td>must stop at either<br/>(but not both)</td>
		</tr>
		<tr ${trStyle}>
			<td style="font-size:30px;">۩</td>
			<td>ayah of sajdah(prostration)</td>
		</tr>
		<tr ${trStyle}>
			<td style="font-size:20px;">۞</td>
			<td>end of a juz</td>
		</tr>
	</table>`);
	$("#tqMessage").show();
	$("#tqv2").hide();
}

function getSuurahTopicAiSummary(surah, topics){
	if(topics === undefined)
		return '';

	var prompt = `You are an expert in Quranic studies, with the scholarly interpretation, explanation, and commentary of the Quran in Islam.

Consider this surah: ${surah.en} with the following topics: 
${topics.map(t=>t.split("|")[0]).join("\n ")}

Provide a detail summary of each topic, with each topic as a separate section.
Also include key verses (in Arabic with chapter and ayah number) related to each topic, and explain the relevance of those verses to the topic.

Provide the final response in language: LLL 
`;

	var topicSummarySpan = `
		<div class="dropdown-content" 
			onclick="$(this).toggleClass('dropdown2')"
			style="position:relative;box-shadow:none;direction:ltr;padding-bottom:8px;padding-top:8px;cursor:pointer;">	
			Summary&nbsp;&gt;
		</div>
		<div class="dropdown-content2" 
			onvisibilitychange="$(this).prev().toggleClass('dropdown2')"
			style="z-index:999;width:auto;left:100px;top:5px;padding-left:6px;text-align:left;background-color:aliceblue;">
				<p 	style="white-space:nowrap;width:auto;cursor:pointer;padding:0;"
					onclick="openGoogleAISearch(&#96;${prompt}&#96;)">Google</p>
				<p 	style="white-space:nowrap;width:auto;cursor:pointer;padding:0;"
				onclick="loadPuterSearch(&#96;${prompt}&#96;)">Puter</p>
		</div>`;
	return topicSummarySpan;
}

function getSurahTopics(surah, topics){
	if(topics === undefined)
		return '';
	var topicSpan = `
		<div class="dropdown-content" 
			onclick="$(this).toggleClass('dropdown2')"
			style="position:relative;box-shadow:none;direction:ltr;padding-bottom:8px;padding-top:8px;cursor:pointer;">	
			Topics&nbsp;&gt;
		</div>
		<div class="dropdown-content2" 
			onvisibilitychange="$(this).prev().toggleClass('dropdown2')"
			style="z-index:999;width:auto;left:100px;top:5px;padding-left:6px;text-align:left;background-color:aliceblue;">`;
					
	for(var i=0; i < topics.length; i++){
		var ayahs = topics[i].split("|")[1];
		ayahs = ayahs.includes(",") ? ayahs.split(",") : [ayahs];
		for(var j=0; j< ayahs.length; j++){
			var verse = surah+':'+ayahs[j];
			var toipcName = topics[i].split("|")[0];
			toipcName += toipcName.includes("(") ? '' : (' ('+verse+')');
			topicSpan += `
				<p 	style="white-space:nowrap;width:auto;cursor:pointer;padding:0;"
					onclick="changeQari=true;isAutoPlayQirat=false;searchText('${verse}')">
					${toipcName}
				</p>`;
		}
	}
	topicSpan += '</div>';
	return topicSpan;
}

function getGraphMenu(index, surah){

	var graphSpan = `
		<div class="dropdown-content" 
			onclick="$(this).toggleClass('dropdown2')"
			style="position:relative;box-shadow:none;direction:ltr;padding-bottom:8px;padding-top:8px;cursor:pointer;">
		Graphs&nbsp;&gt;
		</div>
		<div class="dropdown-content2" 
			onvisibilitychange="$(this).prev().toggleClass('dropdown2')"
			style="width:auto;left:100px;top:10px;padding-left:6px;text-align:left;background-color:aliceblue;">

			<a href="#" 
			   onclick="$('#divOntology iframe').attr('src',
			    	'https://qurananalysis.com/analysis/graphing.iframe.php?s=${(index-1)}&a=${encodeURIComponent(surah.ar)}&lang=AR'); 
				   	$('#divOntology').show();">
			Ontology
			</a>
			<a href="#" 
				onclick="$('#divOntology iframe').attr('src',
					'https://quickchart.io/wordcloud?text=${
								surah.topics.map(w=> encodeURI(w.toLowerCase()
													  .replaceAll(/\|.*$/g,"")
													  .replaceAll("'s "," ")
													  .replaceAll("'","")
													  .replaceAll("\:","")
													  .replace(/^o /g,"")
													  .replaceAll(" pl ","")
													  .replaceAll(" that "," ")
													  .replaceAll(" whose "," ")
													  .replaceAll(" whom "," ")
													  .replaceAll(" who "," ")
													  .replaceAll(" those "," ")
													  .replaceAll(" his "," ")
													  .replaceAll(" her "," ")
													  .replaceAll(" she "," ")
													  .replaceAll(" he "," ")
													  .replaceAll(" their "," ")
													  .replaceAll("they "," ")
													  .replaceAll(" of "," ")
												      .replaceAll(" the "," ")
													  .replaceAll("the "," ")
													  .replaceAll(" a "," ")
													  .replaceAll("a "," ")
													  .replaceAll(" an "," ")
													  .replaceAll(" to "," ")
													  .replaceAll(" and "," ")
													  .replaceAll(" or "," ")
													  .replaceAll(" if "," ")
													  .replaceAll(" by "," ")
													  .replaceAll(" on "," ")
													  .replaceAll(" in "," ")
													  .replaceAll(" at "," ")
													  .replaceAll(" as "," ")
													  .replaceAll(" you "," ")
													  .replaceAll(" with "," ")
													  .replaceAll(" over "," ")
													  .replaceAll(" off "," ")
													  .replaceAll(" from "," ")
													  .replaceAll(" to "," ")
													  .replaceAll(" above "," ")
													  .replaceAll(" below "," ")
													  .replaceAll(" is "," ")
													  .replaceAll(" was "," ")
													  .replaceAll(" are "," ")
													  .replaceAll(" were "," ")
													  .replaceAll(" have "," ")
													  .replaceAll(" had "," ")
													  .replaceAll(" would "," ")
													  .replaceAll(" must "," ")
													  .replaceAll(" should "," ")
													  .replaceAll("between"," ")
													  .replaceAll("about"," ")
													  .replaceAll("upon"," ")
													  .replaceAll(" vs "," ")
													  .replaceAll("do "," ")
													  .replaceAll("not "," ")
													  .replaceAll(" se "," ")
													  .replaceAll(" m "," ")
													  .replaceAll(" for "," ")))
													  .join()
					}'); 
					$('#divOntology').show();">
			Word Cloud
			</a>
		</div>`;
	return graphSpan;			
}

function orderSurahs(chkRev){
	surah_order = chkRev.is(":checked");
	listSurahs();
}

function createTableView(data, div){
	var sOptions = $("#surah-options");
	var sOptions2 = $("#surahList");

	var table = `
		<div id="tqMessage" 
			style="margin-top:10px;width:100%;display:none;align-items:center;">
		</div>
		<div id="tqv2" style="margin-top:10px;width:100%;display:none;">
			<img onclick="switchPage(0);" 
				style="position:relative;width:100%;transform-origin:right;transition: rotateY(0deg)" 
				src="">
			</img>
			<img onclick="switchPage(1);" 
				style="position:relative;width:100%;transform-origin:left;transition: rotateY(0deg)" 
				src="">
			</img>
			<img style="display:none;position:absolute;opacity:30%;left:35%;top:35%;width:30%;" 
				src="images/loading.gif">
			</img>
		</div>
		<table id="tqv1" 
			style="direction:rtl;max-width:512px;margin:auto;padding:0;"
			class="surahIndex">
		<tr>
			<th>Surah</th>
			<th class="chkQ">&nbsp;Qirat&nbsp;</th>
			<th class="chkT">Tafsir</th>
			<th class="chkR">Search</th>
		</tr>`;
		
		var mCount = 0;
		for (const [order_index, surahVal] of Object.entries(data)) {
			var rOrder = surah_order !== undefined && surah_order == true;
			var index = order_index;
			var surah = surahVal;
			// Find chronologic order
			if(rOrder === true){
				let filtered = Object.fromEntries(
					Object.entries(surah_list).filter(([key, value]) => value.r_order.toString() == order_index)
				);
				var keys = Object.keys(filtered);
				if(keys && keys.length > 0){
					index = keys[0].toString();
					surah = filtered[keys[0]];
				}
			}
			var juz	= surah.juz.map((j) => 'juz'+j).join(' ');
			var enName = surah.en.substring(surah.en.indexOf('(')+1, surah.en.length-1)
								 .replace('The','')
								 .trim();
			if(enName.includes(' ')){
				enName = enName.split(' ')[0];
			}
			
			var pgNums = surah.pages.includes("-") ? surah.pages.split("-") : [surah.pages];
			var op = $(`<option value="${index}">${index} ${surah.ar}</option>`);
			sOptions.append(op);
			sOptions2.append(op.clone());
			
			var manzilImg = `<img style="margin:0;margin-right:4px;float:right;height:14px;" 
								title="manzil ${surah.manzil}"
								src="data/qrn/mz/mz${surah.manzil}.jpg">
							</img>`;
										
			var info = `<span style="float:right;">
							<img style="float:right;width:16px;margin-left:3px;background-color:transparent;"
								src="images/info.png" 
								onclick="$(this).parent().toggleClass('dropdown')">
							</img>
							<div class="dropdown-content"
								style="width:360px;right:-26px;margin-top:16px;">
								<img src="images/expand.png" 
									 style="float:right;width:16px;margin-left:3px;
									 	    background-color:transparent; padding:4px;"
									onclick="expandSurahInfoInto(
										$(this).next(),
										'#divOntology iframe')"/>
								<div>
									<a href="#" style="float:left" onclick="handleSurahInfoDisplay(this)">Urdu</a>
									<div style="direction:ltr;">${replaceSurahInfoQLink(surah.en_text)}</div>
									<div style="display:none">${replaceSurahInfoQLink(surah.ur_text ?? surah.en_text)}</div>
								</div>
							</div>
					    </span>`;
			
			var nuzul_title = (surah.nuzul_note !== undefined) ? surah.nuzul_note : surah.nuzul;
			var topicSummary = getSuurahTopicAiSummary(surah, surah.topics)
							   .replaceAll("LLL", 
										   parent.window ? parent.window.getLang(): 'en');
			var topicInfo = getSurahTopics(index, surah.topics);
			var graphInfo = getGraphMenu(index, surah);
			var huruf = surah.huruf === undefined ? '': 
				`<img style="float:right;height:20px;margin-left:3px;background-color:transparent;" 
					  src="data/qrn/huruf/${surah.huruf}.jpg">
				 </img>`;
			var hClass = surah.huruf === undefined ? "noh" : surah.huruf;
			table += `<tr class="${juz} ${surah.nuzul} mz${surah.manzil} ${hClass}">
						<td
							onmouseover="$(this).find('.navUp').show();"
							onmouseout="$(this).find('.navUp').hide();"
							class="qword" 
							style="max-width:100px;font-szie:14px;padding:0;padding-bottom:6px;">
							<span style="display:inline-flex">
							<b  class="navUp"
								style="display:none;float:right;margin:0;margin-top:-6px;padding:0;cursor:pointer;" 
								onclick="bringIntoView($('#playbox'))">&#x2B06;&nbsp;&nbsp;&nbsp;
							</b>
							${info}${huruf}
							<img 
								style="height:16px;margin:0;float:right;"
								title="${nuzul_title}"
								src="images/${surah.nuzul}.jpg">
							</img>
							${manzilImg}
							<sup style="float:right">&nbsp;&nbsp;${index}</sup>
							${
								(rOrder == true) ? 
									`<sup style="float:right">&nbsp;(R:${(surah.r_order)})</sup>`:''
							}
							</span><br/>
							<img 
								src="data/qrn/svg/${index}.svg"
								onclick="toggleQuranView(true, '${index}', '${pgNums[0]}');">
							</img><br/>
							<span style="font-size:12px;display:ruby-text;" onclick="searchText('${enName}')">
								${surah.en.substring(surah.en.indexOf("(")).replace(/\(([^\s])/g, '\( $1')}
							</span>
						</td>
						<td class="chkQ" style="font-size:14px;cursor:pointer;padding:0;">
							<span>${getQuranAudioOptions(index, surah.en, surah.ayahCount)}</span>
						</td>
						<td class="chkT" style="font-size:14px;cursor:pointer;padding:0;">
							<span>${getTafsirAudioOptions(index, surah.en, surah.ar, surah.ayahCount)}</span>
							${
								q_app_mode === 'Quran' ? 
								'' :
							 	`<span>${getTafsirPdfOptions(index, surah.en, surah.ar, surah.ayahCount)}</span>`
							}
						</td>
						<td class="chkR" style="font-size:14px;cursor:pointer;padding:0;">
							<span class="dropdown" style="display:inline;padding:0;cursor:pointer;">
								<button class="dropbtn" 
										style="padding:0;background-color:transparent;color:black;font-size:22px;"
										onclick="toggleDropdownContent(this, true)">
								𐄗
								</button>
								<span class="dropdown-content" style="padding-top:10px;left:0;">
								${topicSummary}${topicInfo}${graphInfo}
								<a 	href="#" 
									onclick="changeQari=true;isAutoPlayQirat=false; searchText('${index}:1')">
									Research <b>1-${surah.ayahCount}</b>
								</a>
								${
									surah.juz.map((j) => `
										<a href="#" onclick="
											var o=$('#juz-options');
											o.val('juz${j}');
											filterSurahs(o,'juz${j}')"> Juz ${j} </a>`)
										.join('')
								}
								${
									pgNums.map((p, ind) => `
										<a href="#" onclick="
											toggleQuranView(true, '${index}', '${p}');">
											${pgNums.length ==1 ? "" : (ind == 0 ? "Start": "End")}
										Page ${p}
										</a>`)
										.join('')
								}
								</span>
							</span>
						</td>
					</tr>`;	
			mCount = surah.manzil;
		}
		table = table+'</table>';
		div.append($(table));
}

function createGridView(data, div){
	var sOptions = $("#surah-options");
	var sOptions2 = $("#surahList");

	var table = `
		<div id="tqMessage" 
			style="margin-top:10px;width:100%;display:none;align-items:center;">
		</div>
		<div id="tqv2" 
			style="margin-top:10px;width:100%;display:none;">
			<img onclick="switchPage(0);" 
				style="position:relative;width:100%;transform-origin:right;transition: rotateY(0deg)" 
				src="">
			</img>
			<img onclick="switchPage(1);"
				style="position:relative;width:100%;transform-origin:left;transition: rotateY(0deg)" 
				src="">
			</img>
			<img style="display:none;position:absolute;opacity:30%;left:35%;top:35%;width:30%;" 
				src="images/loading.gif">
			</img>
		</div>
		<div id="tqv1" class="surahIndex" style="direction:rtl;margin:auto;padding:0;">`;

		var mCount = 0;
		for (const [order_index, surahVal] of Object.entries(data)) {
			mCount++;
			var rOrder = surah_order !== undefined && surah_order == true;
			var index = order_index;
			var surah = surahVal;
			
			// Find chronologic order
			if(rOrder === true){
				let filtered = Object.fromEntries(
					Object.entries(surah_list).filter(([key, value]) => value.r_order.toString() == order_index)
				);
				var keys = Object.keys(filtered);
				if(keys && keys.length > 0){
					index = keys[0].toString();
					surah = filtered[keys[0]];
				}
			}
			var juz	= surah.juz.map((j) => 'juz'+j).join(' ');
			var enName = surah.en.substring(surah.en.indexOf('(')+1, surah.en.length-1)
								 .replace('The','')
								 .trim();
			if(enName.includes(' ')){
				enName = enName.split(' ')[0];
			}
			
			var pgNums = surah.pages.includes("-") ? surah.pages.split("-") : [surah.pages];
			var op = $(`<option value="${index}">${index} ${surah.ar}</option>`);
			sOptions.append(op);
			sOptions2.append(op.clone());
			
			var manzilImg = `<img style="margin:0;margin-right:4px;float:right;height:14px;"
								title="manzil ${surah.manzil}"
								src="data/qrn/mz/mz${surah.manzil}.jpg">
							 </img>`;
										
			var info = `<span style="float:right;">
						   	<img style="float:right;width:16px;margin-left:3px;background-color:transparent;"
								src="images/info.png" 
								onclick="$(this).parent().toggleClass('dropdown')">
							</img>
						   	<div class="dropdown-content"
								style="width:360px;right:-26px;margin-top:16px;">
								<a 	href="#" style="float:left" 
									onclick="handleSurahInfoDisplay(this)">Urdu</a>
								<div style="direction:ltr;">
									${replaceSurahInfoQLink(surah.en_text)}
								</div>
								<div style="display:none">
									${replaceSurahInfoQLink(surah.ur_text ?? surah.en_text)}
								</div>
							</div>
					   	</span>`;
			
			var nuzul_title = (surah.nuzul_note !== undefined) ? surah.nuzul_note : surah.nuzul;
			var topicInfo = getSurahTopics(index, surah.topics);
			var graphInfo = getGraphMenu(index, surah);
			var huruf = surah.huruf === undefined ? '': 
				`<img style="float:right;height:16px;background-color:transparent;"
					  src="data/qrn/huruf/${surah.huruf}.jpg">
				 </img>`;
			var hClass = surah.huruf === undefined ? "noh" : surah.huruf;
			
			var clearStyle = '';
			var box = $("div[class*=juz]");
			console.log("box.length = " + box.length);
			if( box.length > 0){
				var divWidth = box.first().width();
				var count= $(document).width() / divWidth;
				console.log("mCount = " + mCount);
				clearStyle = mCount % count ? 'clear:both;' : '';
			}
			
			table += `
				<div class="${juz} ${surah.nuzul} mz${surah.manzil} ${hClass}"
					onmouseover="
						$(this).find('.play-menu').show();
						$(this).css('background-color','#f6f6c3');
						$(this).css('border-color','groove');"
					onmouseout="
						$(this).find('.play-menu').hide();
						$(this).css('background-color','transparent');
						$(this).css('border','groove');" 
					style="max-height:80px;max-width:74px;float:right;
						  	font-szie:14px;padding:20px;
							border-color:gray;border:groove;">
					<div class="qword" >
						<span>
							<b class="navUp"
								style="display:none;float:right;margin:0;margin-top:-6px;padding:0;cursor:pointer;"
								onclick="bringIntoView($('#playbox'))">&#x2B06;&nbsp;&nbsp;&nbsp;</b>
								${info}
								${huruf}
								<img style="height:16px;margin:0;float:right;"
									title="${nuzul_title}" src="images/${surah.nuzul}.jpg">
								</img>
								${
									(rOrder === false) ? `<sup style="float:right">&nbsp;&nbsp;${index}</sup>`: ''
								}
								${
									(rOrder === true) ? `<sup style="float:right">&nbsp;(R:${surah.r_order})</sup>`:''
								}
						</span>
						<br/>
						<img src="data/qrn/svg/${index}.svg" 
							style="cursor:pointer;"
							onclick="$(this).parent().find('.play-menu').toggle();">
						</img>	
						<div style="font-size:12px;display:ruby-text;text-align:center" >
						${		
							surah.en.substring(surah.en.indexOf("("))
									.replace(/\(([^\s])/g, '\( $1')
									.replace('The ','')
									.replace('A ','')
						}
						</div>
						<!-- >surah options menu -->
						<div class="play-menu"
							style="display:none;padding:0;margin:0;margin-top:-30px;
									box-shadow:rgba(0, 0, 0, 0.24) 0px 3px 8px;">
							<span class="chkR" 
								  style="display:inline;font-size:14px;padding:0;cursor:pointer;">
								<div class="dropdown" 
									style="display:inline;padding:0;">
									<span style="font-size:20px;" 
										onclick="toggleDropdownContent(this, true)"><b>𐄗</b>
									</span>
									<span class="dropdown-content" style="left:-70px;top:-10px;">
										${topicInfo}
										${graphInfo}
										<a href="#" 
											onclick="
												changeQari=true;
												isAutoPlayQirat=false; 
												searchText('${index}:1')">Research <b>1-${surah.ayahCount}</b>
										</a>
										${
											surah.juz.map((j) => `
											<a 	href="#"
												onclick="
													var o=$('#juz-options');
													o.val('juz$${j}');
													filterSurahs(o,'juz${j}')"> Juz ${j} </a>`)
											.join('')
										}
										${
											pgNums.map((p, ind) => `
											<a 	href="#" 
												onclick="toggleQuranView(true, '${index}', '${p}');">
												${
													(pgNums.length ==1 ? "" : (ind == 0 ? "Start": "End"))+' Page '+ p
												}
											</a>`
											).join('')
										}
									</span>
								</div>
							</span>
						</div>
					</div>
				</div>`;	
		}
		table = table+'</div>';
		div.append($(table));
}

function changeSurahDisplayMode(elem){
	surah_disp_mode = elem.is(':checked') ? 'grid':'table';
	listSurahs();
}

function getVerseKeyFromElement(id, prefix){
	var tk = id.replace(prefix,'').split('_');
	if(tk){
		return tk[0]+':'+tk[1];
	}
	return '';
}

function copyAyahText(className){
	var spans = $("div[id*=vdiv]").find("span[class="+className+"]");
	var text = '';
	spans.each(function(i, v){
		if(text != '') text+= ' ';
		text += $(v).text();
		var verseKey = getVerseKeyFromElement($(v).parent().prop('id'), 'vdiv')
		if(verseKey !== ''){
			text += ' [Quran '+verseKey+']';
		}
	});
	if(text != ''){
		copyTextToClipboard(text);
	}
}

function copyTafsirText(){
	var txt = $("#tafsir").text();
	if(txt && txt.length > 0){
		var id = $("#tafsir").prev('div').prop('id');
		var verseKey = getVerseKeyFromElement(id, 'div')
		if(verseKey != ''){
			txt += ' [Quran '+verseKey+']';
		}
		copyTextToClipboard(txt);
	}
}

function copyAyahImagePath(){
	var id = $("#tafsir").prev('div').prop('id');
	var verseKey = getVerseKeyFromElement(id, 'div');
	if(verseKey != ''){
		verseKey = verseKey.replace(':', '_');
		copyTextToClipboard(`https://everyayah.com/data/images_png/${verseKey}.png`);
	}
}

function copyAyahMp3Path(){
	var url = ($("img[title='Play Qirat']")[0].onclick+'')
				.match(/'([^']*)'/g)[0];
	if(url !== null){
		url = url.replaceAll('\'', '');
		
		// Update Qari
		var selected_qari = document.getElementById('qari-options').value;
		var current_url = decodeURI(url);
		var current_qari = current_url.replace("https://everyayah.com/data/",'')
									.split("/")[0];
		var url2  = encodeURI(current_url.replace(current_qari, selected_qari));
		copyTextToClipboard(url2);
	}
}

function  expandSurahInfoInto(elem, targetElem){
	console.log(elem.html());
	var direction = $(elem).find('a').text() == 'Urdu' ? 'ltr':'rtl';
	var elemContent = $(elem.html());
	var content = `<body dir='${direction}'>
	<button onclick="
		var p = parent.parent;
		if(p && p.playTextAll){
			var div = document.getElementsByTagName('body')[0];
			p.playTextAll(div.innerText, ${direction=='ltr' ? `'en-US'`:`'ur-PK'`});
		}
	">Read</button>	
	${
		(direction == 'ltr')? 
			elemContent[2].innerHTML :
			elemContent[4].innerHTML
	}</body>`;
	$(targetElem).attr('srcdoc', content);
	$(targetElem).parent().show();
}