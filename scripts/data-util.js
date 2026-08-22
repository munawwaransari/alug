//
//	Author: munawwar_ali@yahoo.com
//

function getLocationPath(){
	return window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
}

function getSiteLocationPath(url){
	return url.substring(0,window.location.href.lastIndexOf("/")+1);
}

function getParamValue(paramName) {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName) ?? undefined;
}

async function ensureJsonData(d)
{
	return new Promise((resolve, reject) => {
		if (parent.dataCache === undefined || parent.dataCache[d.name] === undefined) {
			console.log("Error: Invalid cache state for: " + d.name);
			reject("Invalid cache state for: " + d.name);
		}
		if (parent.dataCache[d.name].data) {
			resolve(parent.dataCache[d.name].data, true);
		}
		else {
			var loc = getLocationPath() + parent.dataCache[d.name].path;
			var extension = loc.split('.').pop().toLowerCase();
			if (extension === "zip") {
				loadZipData(loc, d.file)
					.then((data) => {
						// Load Surah names
						parent.dataCache[d.name].data = data;
						resolve(data, false); 
					});
			}
			else if (extension === "json") {
				loadJsonData(loc)
				.then((data) => {
					parent.dataCache[d.name].data = data;
					resolve(data, false); 
				})
				.catch((err) => {
					reject(err);
				});
			}
			else if(extension == "ttf"){
				loadHtmlData(loc)
				.then((data) => {
					parent.dataCache[d.name].data = data;
					resolve(data, false); 
				})
				.catch((err) => {
					reject(err);
				});
			}
			else {
				console.log(`Error: Invalid data file extension for: ${loc}`);
			}
		}
	});
}

async function loadJsonData(url)
{
	console.log('Fetching JSON data: '+ url);
	const fetchUrl = new URL(url);
	fetchUrl.searchParams.set('nocache', Date.now());
	try {
		const response = await fetch(fetchUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.json();
	} 
	catch (error) {
		console.error("Fetch error:", error);
	}
}

async function loadHtmlData(url)
{
	console.log('Fetching Html/text data: '+ url);
	const fetchUrl = new URL(url);
	try {
		const response = await fetch(fetchUrl);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		return response.text();
	} 
	catch (error) {
		console.error("Fetch error:", error);
	}
}

async function loadZipData(url, file)
{
	try {
		console.log('Fetching zip: '+ url);
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		var jsZip = new JSZip();
		return new Promise((resolve, reject) => {
			jsZip.loadAsync(response.blob())
				.then(function (zip){
					zip.file(file)
					.async("string")
					.then(function(data){
							if(file.endsWith(".json")){
								var zdata = JSON.parse(data);
								resolve(zdata); 	
							}						
						})
				.catch(function(err){
					console.error("Error reading zip file: ", err);
					if(reject) reject(err);
				});
			});
		});
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
	// Combine all replacements into a single regex for a single pass
    // 1. [ًٌٍََُِّْٰۡ]+ matches any sequence of diacritics
    // 2. [ٱإأ] matches various Alifs to normalize to 'ا'
    // 3. ى is handled separately to map to 'ي'
	return txt.replaceAll(/[ًٌٍََُِّْٰۡ]/g, '')
				.replaceAll(new RegExp("ٱ", "g"), 'ا')
				.replaceAll(/[ٱإأ]/g, 'ا')
				.replaceAll(/ى/g, 'ي');
}

function replaceWord(w) {
    const punctuation = "ۡۧ ـ\t ۦۥۣۤۢۡ۠۟۞۝ۜۛۚۙۘۗۖە";
    return w.text
        .replace(new RegExp("[" + punctuation + "]+", "g"), '') // Remove punctuation
        .replace(/[ٱٰ]/g, 'ا')        // Normalize Alif and Dagger Alif to Alif
        .replace(/ىٰ/g, 'ى')         // Normalize Alif Maqsura with Dagger
        .replace(/وَال/g, 'ال')      // Strip "Wa" prefix from "Al"
        .replace(/لِل/g, '');        // Remove "Li" prefix from "Al"
}

function removePunctuations(w){
	//var punctuation = "ۡۧـۦۥۣۤۢۡ۠ٓ۟۞۝ۜۛۚۙۘۡۗۖەۢ";
	var punctuation = /[\u06df\u06e7\u0640\u06e6\u06e5\u06e4\u06e3\u06e2\u06df\u06e0\u0653\u06e1\u06dd\u06de\u06da\u06db\u06d9\u06d8\u06df\u06d7\u06d6\u06c7\u06e2]+/g;
	return w.replace(punctuation, '');
}

function filterMTableRows(match, index, text){
	const tab = $(`table[id*=${match}]`);
	if(text == 'all'){
		tab.css('display', '');
	}else{
		tab.css('display', 'none');
		var tab2 = $(`table[id=${match}${index}]`);
		var p = tab2.parent();
		tab2.remove();
		$(".nFilterDiv").after(tab2);
		tab2.css('display', '');
	}
}

function filterTableRows(table, column, searchText, allText, useInclude) {
    const rows = $(`${table} tr`);
    const cells = rows.find('td, th');
    
    // 1. Normalize Search Text
    let txt = searchText ? removeAlPrefix(removePunctuations(searchText)) : searchText;
    
    // 2. Quick Reset for "Show All"
    if (txt === allText) {
		rows.show();
        cells.show();
        return;
    }

    // 3. Clean quotes and Prepare Search
    txt = txt.replace(/^'|'$/g, '').trim();
    const method = useInclude ? 'includes' : 'startsWith';

    // 4. Single Pass Filtering
    rows.each(function() {
        const row = $(this);
        const targetCell = column > 0 
            ? row.find(`td:nth-child(${column}), th:nth-child(${column})`) 
            : row.find('td');

        const cellText = targetCell.text().trim();
        const isMatch = cellText[method](txt);

        // Toggle visibility of the entire row based on match
        row.toggle(isMatch);
    });

    // 5. Specific Column Logic (if needed to hide the matching cell specifically)
    if (column > 0) {
        $(`${table} tr td:contains('${txt}')`).hide();
		$(`${table} tr th:nth-child(${column})`).hide();
    }
}

function isOS(os){
	return navigator.userAgent.includes(os+";") || 
	navigator.userAgent.includes(os);
}

function replaceAnalysisLink(val, addBreak){
	var analysisExp = /([\u0600-\u06ff]+)\s+\-\s+([\u0600-\u06ff]+)/g;
	var ex = val;
	var res = '';
	if(ex.match && ex.match(analysisExp)){
		ex = ex.replaceAll(analysisExp, `
			<a 	href="#" style="text-decoration: none;"
				onclick="$('#wordSearchText').val('$1');analyzeSelectedWord();">$1 - $2</a>
		`);
		res = `<span style="font-size:18px;">${addBreak ? '<br/>':''}${ex}</span>`;
	}
	return res;
}

function replaceSurahInfoQLink(addressHtml) {
	var qlinkExp = /^(<a\s+.*(\d+)\/(\d+)\-(\d+).*a>)/g;
	if(addressHtml.match && addressHtml.match(qlinkExp)){
		return addressHtml.replaceAll(qlinkExp, '$2:$3-$4');
	}
	return addressHtml;
}

function replaceQLink(val, addBreak=true){
	var analysisLink = replaceAnalysisLink(val, true);
	if(analysisLink !== ''){
		return analysisLink;
	}
	
	var ex = val;
	var qlinkExp = /(\[(\d+)\:(\d+)\])/g;
	const hasMatch = ex.match && ex.match(qlinkExp);
	if(hasMatch){
		ex = val.replace(qlinkExp, `
			<a 	href="#" onclick="
				if(parent.inSearch) 
					parent.inSearch('...QuranSearch $2:$3');">
			$1
			</a>
		`);
	}
	const prefix = (hasMatch && addBreak) ? '<br/>' : '';
	return `<span style="font-size:18px;">${prefix}${ex}</span>`;
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

function removeAlPrefix(txt){
	if(txt.startsWith('ال') && txt.length > 4)
		return txt.substring(2);
	return txt;
}

function removeTimePrefix(txt){
	if(txt[0] === 'و')
		return txt.substring(2);
	return txt;
}

async function tesseract_imageToText(url, lang, callback){
	var cb = callback;
	Tesseract.recognize(
		url, lang
	).then(result => {
		cb(true, result.data.text);
	}).catch(err => {
		cb(false, err);
	});
}

function playCard(text, altText){
	if(parent.playText) {
		if(text === 'undefined')
			parent.playText(altText, 'en-US', {'en-US': altText});
		else
			parent.playText(text, 'ar-SA', {'en-US': altText});
	}
}

function lookupEx(site, txt, errorText){
	
	if(errorText && (txt === undefined || txt === "")){
		alert(errorText);
		return;
	}
	var  word = txt ?? $("#wordSearchText").val();
	if (word && word.match(/[\u0621-\u064A]+/g)) {		
		var w = parent ? parent.window : window;
		var lang = parent.getLang ? parent.getLang(): 'en';
		if(site.includes('$'))
			site = site.replace('$', lang);
		var url = site+removePunctuations(word);
		w.open(url, "_blank");
	}
	else if(errorText){
		alert(errorText);
	}
}

function lightenWord(word){
	if(word){
		word = word.trim();
		word = word.replace(/ٰ/g, 'ا'); // replace mad harkat with alif
		word = word.replace(/(ٓ)([^ا|أ|إ|آ])/g,'ا$2');
		word = removePunctuations(word);
		word = removeAlPrefix(word);
		word = word.replace(/ة$/g, '');
		word = word.replace(/([ًٌٍَُِّْ])/g, ''); //reove Erab
	}
	return word;
}

function analyzeLocal(txt){
	if(parent && parent.redirect){
		var word = txt ?? $(".sel-word").text().trim();
		if(word !== ""){
			parent.redirect("dict.html", 
							"analyze", 
							word);
		}
	}
}

function loadAllVoices(sel, voicesAll ){
	if(sel && sel.append){
		var filter = {}, o = '';
		for(var i = 0; i < voicesAll.length; i++){
			var lang = voicesAll[i].value.replace(/^([a-z]{2}-[A-Z]{2})(\d+)$/g,'$1')
			if(lang && filter[lang] === undefined){
				var value = ` value="${lang}" `;
				o += `<option ${value}>${lang}</option>`;
				filter[lang] = true;
			}
		}
		sel.children().remove().end();
		sel.append($(o));
	}
}

function toggleDropdownContent(elem, state){
	if(state){
		$(elem).next().addClass("dropdown-content");
		$(elem).next().show();
	}else{
		$(elem).next().toggleClass("dropdown-content");
		$(elem).next().toggle();
	}
}

function getDurationString(given_seconds){
	hours = Math.floor(given_seconds / 3600);
	minutes = Math.floor((given_seconds - (hours * 3600)) / 60);
	seconds = given_seconds - (hours * 3600) - (minutes * 60);
	timeString = Math.floor(hours).toString().padStart(2, '0') + ':' + 
				 Math.floor(minutes).toString().padStart(2, '0') + ':' + 
				 Math.floor(seconds).toString().padStart(2, '0');
	return timeString;
}

function bringIntoView(elem, delay=1600){
	var el = elem; //$(elem);
	if(el.length > 0){
		$([document.documentElement, document.body]).animate({
			scrollTop: $(elem).offset().top
		}, delay);
	}
}

var supportsPassive;
function getPassiveOption(){
	if(supportsPassive === undefined){
		try {
		  return Object.defineProperty({}, 'passive', {
			get: function() {
			  supportsPassive = true;
			}
		  });
		} catch (e) {
			supportsPassive = false;
			console.log("Passive support: "+ supportsPassive);
		}	
	}
	return supportsPassive ? { passive: true } : { passive: false };
}

function toDataURL(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      var fr = new FileReader();
      fr.onload = function(){
        callback(this.result);
      };
      fr.readAsDataURL(xhr.response); // async call
    };
    
    xhr.send();
}

function togglePlayControls(flag){
	$("#playbox").parent().css('display', flag ? 'inline-block' : 'none');	
}

function enableLookupMenuOptions(elem){
	var el = $(elem);
	if(el.is(":visible")){
		if($(".sel-word").length == 0){
			el.next().first().show();
		}else{
			el.next().first().hide();
		}
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

function toggleQHead(){
	if($("#imgQHead").prop('src').endsWith("up.png")){
		$("#imgQHead").prop('src', 'images/dn.png');
		$("#divQHead").hide();
	}
	else{
		$("#imgQHead").prop('src', 'images/up.png');
		$("#divQHead").show();
	}
	changeDisplayLayout();
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
		var durationVal = $("#qt-value")
		parent.playAudio(url2, function(action, data){
			
			if(action == "loadstart"){
				durationBar.attr('value',0);
				durationVal.html('');
			}
			else if(action == "progress"){
				if(data && data.ct){
					durationBar.attr('value', data.ct);
					durationVal.html(getDurationString(data.ct));
				}
			}
			else if(action == "loadeddata"){
				if(data){
					durationBar.attr('max', data.duration);
					durationBar.attr('value', data.ct);
					durationVal.html(getDurationString(data.ct));
					//durationBar.parent().css('display', 'inline-block');
					togglePlayControls(true);
				}
			}
			else  if(action == "pause" || action == "ended"){
				togglePlayButtons(verseKey, "visisble", "collapse");
				if(action === "ended"){
					//durationBar.parent().hide();
					togglePlayControls(false);
				}else{
					var v = $("#qt-pause").html(); 
					$("#qt-pause").html(v === "⏯" ? "⏸" :"⏯");
				}
			}
			
			if (cb) cb(action, data);
		});
		
		togglePlayButtons(verseKey, "collapse", "visisble");
	}
}

function stopPlayVerse(){	
	//$("#playbox").hide();
	togglePlayControls(false);
	if(parent && parent.stopAudio){
		parent.stopAudio();
	}
}

function togglePlayButtons(verseKey, v, h){
	var id = verseKey.replace(":","_");
	var elem = document.getElementById(id);
	
	if(elem !== null && elem != undefined){
		var vW = v[0] === 'v' ? 'width:20px' : 'width:0px';
		var hW = h[0] === 'v' ? 'width:20px' : 'width:0px';
		elem.children[0].style = 'visibility:'+v+';'+vW+';cursor:pointer;';
		elem.children[1].style = 'visibility:'+h+';'+hW+';cursor:pointer;';
	}
}

function updateLang(url){
	lang = parent.getLang ? parent.getLang() : lang;
	var current_url = decodeURI(url);
	var current_lang = current_url.replace("https://glosbe.com/ar/",'').split("/");
	return encodeURI("https://glosbe.com/ar/"+lang+"/"+current_lang[1]);
}

var last_ch_play_id;
function playQuranChapterUrl(url, id){

  	if (last_ch_play_id)
		stopQuranChapter(last_ch_play_id);
	$("#"+id+"+.dropdown-content").hide();
	$("#"+id).hide();
	$("#"+id+"-play-progress").hide();
	$("#"+id+"-progress").show();
	var durationBar = $("#qt-duration");
	var durationVal = $("#qt-value")
	
	if(parent && parent.playAudio){
		
		last_ch_play_id = id;
		if(id.startsWith('t-ch')){
				$("#"+id.replace('t-ch','t-pdf')).hide(); //hide tafseer icon
		}
		
		var pauseBtn = $("#qt-pause");
		parent.playAudio(url, function(action, data){		
			if(action == "loadstart"){
				$("#"+id).hide();
				$("#"+id+"-play-progress").hide();
				$("#"+id+"-progress").show();
				durationBar.attr('value',0);
				durationVal.html('');
			}
			else
			if(action == "progress"){
				if(data && data.ct){
					durationBar.attr('value', data.ct);
					durationVal.html(getDurationString(data.ct));
					$("#"+id+"-play-progress").show();
					$("#"+id+"-pause").hide();
					$("#"+id).hide();
				}
			}
			else if(action == "loadeddata"){
				if(data){
					durationBar.attr('max', data.duration);
					durationBar.attr('value', data.ct);
					durationVal.html(getDurationString(data.ct));
					//durationBar.parent().css('display', 'inline-block');
					togglePlayControls(true);
				}

				$("#"+id+"-progress").hide();
				$("#"+id+"-play-progress").show();
				$('#'+id+'-pause').show();
				$("#qt-stop").show();
				$("#qt-fb").show();
				$("#qt-ff").show();
				$("#"+id).hide();
				selectSurahCell($("#"+id).parent().parent().parent(), true);
			}
			else
			if(action == "pause"){
				pauseBtn.html(pauseBtn.html() === '\u23F8' ? '\u23EF' : '\u23F8');
				$("#"+id).html('⏸');
				$("#"+id).show();
				$('#'+id+'-pause').show();
				$("#"+id+"-progress").hide();
				$("#"+id+"-play-progress").hide();
			}
			else if(action == "ended"){
				stopQuranChapter(id);
				if(last_ch_play_id)
					stopQuranChapter(last_ch_play_id);
				last_ch_play_id = undefined;
				//durationBar.parent().hide();
				togglePlayControls(false);
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
		
		var pauseBtn = $("#qt-pause");
		if(pauseBtn.html() === "\u23EF"){ // resume
			parent.resumeAudio();
			pauseBtn.html('\u23F8'); //pause			
		}else{
			parent.pauseAudio();
		} 
	}
}

function stopQuranChapter(){
	var id = last_ch_play_id;
	if(parent && parent.stopAudio){
		parent.stopAudio();

		//$("#playbox").hide();
		togglePlayControls(false);
		selectSurahCell($("#"+id).parent().parent().parent(), false);
		if(id && id.startsWith('t-ch')){
			$("#"+id.replace('t-ch','t-pdf')).show();
		}
		
		if(id){
			setTimeout(function(){ 
				$("#qt-pause").html('⏸');
				//$("#"+id).html('▶');
				$("#"+id).html($("#"+id).attr('data-value'));
				
				var sel = $("#juz-options").val();
				if(sel !== 'all'){
					filterSurahs(sel, last_ch_play_id);
				}
			},5);
		}
		else{ // mushaf mode
			var stp = $("#juz button").last();
			if(stp && stp.html() !== '▶')
				stp.html('▶');
			$("#pagePlay").html('▶');
		}
	}
	if(id) $("#"+id).show();
}

function selectPageQari(qElement){
	var sp = $(qElement).parent().parent().find("span.pg_qari");
 	if(sp.length > 0)
		sp.removeClass('pg_qari');
	$(qElement).addClass('pg_qari');
}

function getPageQari(elem){
	var sp = $(elem).next().find("p span.pg_qari");
	var qari = 'Abdul_Basit_Murattal_64kbps';
	if(sp && sp.length > 0){
		qari = sp.attr('qari').trim();
	}
	return qari;
}

function playOrStopCurrentPage(elem){
	var state = $(elem).html().trim();
	if(state === '▶'){ //play

		var page = $("#page-options").val().replace('page','');
		if(page.length < 2) page = '0'+page;
		if(page.length < 3) page = '0'+page;

		var qari = getPageQari(elem);
		var url = `https://everyayah.com/data/${qari}/PageMp3s/Page${page}.mp3`;
		
		var durationBar = $("#qt-duration");
		var durationVal = $("#qt-value")

		$(elem).html('⏹');
		var pauseBtn = $("#qt-pause");
		if(parent && parent.playAudio){
			parent.playAudio(url, function(action, data){
				
				if(action == "loadstart"){
					durationBar.attr('value',0);
					durationVal.html('');
				}
				else if(action == "progress"){
					if(data && data.ct)
						durationBar.attr('value', data.ct);
						durationVal.html(getDurationString(data.ct));
				}
				else if(action == "loadeddata"){
					if(data){
						durationBar.attr('max', data.duration);
						durationBar.attr('value', data.ct);
						durationVal.html(getDurationString(data.ct));
						//durationBar.parent().css('display', 'inline-block');
						togglePlayControls(true);
					}
				}
				else if(action == "pause"){
					pauseBtn.html(pauseBtn.html() === '\u23F8' ? '\u23EF' : '\u23F8');
				}
				else if(action == "ended"){
					$(elem).html('▶');
					//durationBar.parent().hide();
					togglePlayControls(false);

					// trigger nav
					var isPageEven = ( parseInt(page) % 2 === 0);
					if(page_layout_size > 1 && isPageEven === false){
						switchPage(0);
						setTimeout(function(){
							playOrStopCurrentPage(elem);
						}, 500);
					}
					else if(navigatePage(true, page_layout_size) == true){
						if(isPageEven){
							switchPage(1);
						}
						setTimeout(function(){
							playOrStopCurrentPage(elem);
						}, 500);
					}
				}
			});
		}
	}else{ // stop
		if(parent && parent.stopAudio){
			parent.stopAudio();
			$(elem).html('▶');
			//durationBar.parent().hide();
			togglePlayControls(false);
		}
	}
}

function resetPlayboxIfVisible(){
	var elem = $('#playbox'); 
	if(elem.is(':visible')) {
		if(parent && parent.stopAudio){
			//setTimeout(function(){
				parent.stopAudio();
				$("button:contains('⏹')").html('▶');
				togglePlayControls(false);
			//}, 100);
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
		var openlink = `var w = parent.window ? parent.window : window;
						w.${ isAndroid ? 
							`open('${encodeURI(url)}', '_blank');`:
							'openInline(this.href);'
						}`;
					
		options += `<a 	href="${isAndroid ? '#' : encodeURI(url)}" 
						onclick="${openlink}">${k}
					</a>`;
	}
	return `
	<span 	
		class="dropdown" style="direction:ltr;">
		<button id="${id}" class="dropbtn" 
				onclick="toggleDropdownContent(this, true)"
				style="background-color:transparent;color:black;font-size:22px;">
			📓
		</button>
		<div class="dropdown-content" style="">${options}</div>
	</span>`;
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
			
			"Kanz-ul-Iman (Ahmed Raza Khan Barelvi)":
			"https://siraatalmustaqim.com/wp-content/uploads/2020/11/@index@-@chapter-en@.mp3",
			
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
					   .replace('@chapter-en@', chapterEn.replace(' (Hud)', '')
														 .replace(' (Ta-Ha)', '')
														 .replace(' (Luqman)', '')
														 .replace(' (Ya-seen)', '')
														 .replace(' (Muhammad)', '')
														 .replace(' (Noah)', '')
														 .replace(' (Quraish)', ''))
					   .replace('@chapter-ar@', 'سورة '+chapterAr);
					   
					if(['7','12','25','27'].includes(index) == false){
						url = url.replace('(','( ').replace(')',' )');
					}
				break;
				
				case "Kanz-ul-Iman (Ahmed Raza Khan Barelvi)":
					var cn = chapterEn.split(" ")[0]
									  .replace('\'','')
									  .replace('At-','Al-')
									  .replace('An-','Al-')
									  .replace('Ar-','Al-')
									  .replace('As-','Al-')
									  .replace('Az-','Al-')
									  .replace('Ad-','Al-')
									  .replace('Adh-','Al-')
									  .replace('Ash-','Al-');
					url = url.replace('@index@', ch);
					var chapter_map = {
						'Al-Fatihah': 'Al-Fatiha',
						'Al-Baqarah': 'Baqarah',
						'Al-Imran': 'Imran',
						'An-Nisa': 'Al-Nisa',
						'Al-Maidah': 'Maida',
						'Al-Anam': 'Al-Anaam',
						'Al-Araf': 'Al-Araaf',
						'Al-Anfal': 'Al-Anfaal',
						'Al-Taubah': 'Al-Touba',
						'Yunus': 'Younus',
						'Hud': 'Hood',
						'Yusuf': 'Yousuf',
						'Ar-Rad': 'Al-Raad',
						'Al-Isra': 'Bani-Israael',
						'Maryam': 'Al-Maryam',
						'Taha': 'Al-Taha',
						'Al-Anbiya': 'Al-Anbia',
						'Al-Muminoon': 'Al-Mominoon',
						'Al-Naml': 'Al-Namal',
						'Al-Ankaboot': 'Al-Ankabut',
						'Al-Room': 'Al-Rum',
						'Al-Sajdah': 'Al-Sajda',
						'Ya-seen': 'Yaseen',
						'Al-Saaffat': 'Al-Saffat',
						'Sad': 'Al-Suad',
						'Ghafir': 'Al-Momin',
						'Fussilat': 'Ha-Mim-Sajdah',
						'Al-Dukhan': 'Al-Dokhan',
						'Al-Jathiya': 'Al-Jathiah',
						'Al-Ahqaf': 'Al-Ahquaf',
						'Muhammad': 'Mohammad',
						'Al-Fath': 'Al-Fatah',
						'Al-Hujurat': 'Al-Hujraat',
						'Al-Dhariyat': 'Al-Zariat',
						"Al-Hadid": "Al-Hadeed",
						"Al-Mumtahanah": "Al-Mumtahinah",
						"Al-Jumuah": "Al-Jumah",
						"Al-Haaqqah": "Al-Haqqah",
						"Nooh": "Nuh",
						"Al-Muzzammil": "Al-Mozammil",
						"Al-Muddaththir": "Al-Mudaththir",
						"Al-Insan": "Al-Dahr",
						"Al-Infitar": "Al-Inftitar",
						"Al-Mutaffifin": "Al-Mutafifeen",
						"Al-Burooj": "Al-Buruj",
						"Al-Ghashiya": "Al-Ghasiyah",
						"Al-Layl": "Al-Lail",
						"Al-Dhuha": "Al-Duha",
						"Al-Sharh": "Al-Inshirah",
						"Al-Tin": "Al-Teen",
						"Al-alaq": "Al-Alaq",
						"Al-Zalzalah": "Al-Zilzal",
						"Al-adiyat": "Al-Adiyat",
						"Al-Takathur": "Al-Takatur",
						"Quraish": "Al-Quraish",
						"Al-Kauthor": "Al-Kausar",
						"Al-Kafiroon": "Al-Kafirun",
						"Al-Nasr": "Al-Nasar",
						"Al-Masad": "Al-Lahab",
						"Al-Nas": "Al-Naas"
					};
					if(chapter_map[cn])
						url = url.replace('@chapter-en@', chapter_map[cn])
					else
						url = url.replace('@chapter-en@', cn);
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
						options += `
						<div class="dropdown-content dropdown2" style="position:relative">${k}</div>
						<div class="dropdown-content2" style="margin-left:60px;">`;
								   
						ayat_map[ch].every(function(part){		
							var urlCopy = url.replace('@Part@', part.startsWith('A') ? '-'+part : part);
							options += `
								<p onclick="playQuranChapterUrl('${encodeTafsirUrl(urlCopy)}','${id}')">
								${part}
								</p>`;
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
			options += `
			<p onclick="playQuranChapterUrl('${encodeTafsirUrl(url)}','${id}')">
			${k}
			</p>`;
	}
	
	return getPlayControlsHtml(id, options, '𐄍'); //'▶');
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
				options += `
					<p onclick="playQuranChapterUrl('${url}','${id}')">
					${lang}
					</p>`;	
			}				
		}
		else if(lang === "Telugu"){
			if(chapter < 101){
				var url = encodeURI("https://archive.org/download/OnlyTeluguAudioQuranTranslationMp3/Telugu_Audio_Quran_Translation_Mp3_Quran/"+ch+"_Only_Telugu_Audio_Quran_Translation_Mp3_Quran_VideoQuran.Net.mp3");
				options += `
					<p onclick="playQuranChapterUrl('${url}','${id}')">
					${lang}
					</p>`;
			}
		}
		else{
			var url = encodeURI('https://www.truemuslims.net/Quran/'+lang+'/'+ch+'.mp3');
			options += `
				<p onclick="playQuranChapterUrl('${url}','${id}')">
				${lang}
				</p>`;
		}
		return true;
	});
	
	return getPlayControlsHtml(id, options, '𐄖'); //'▶');
}

function getPlayControlsHtml(id, options, symbol){
	return `
	<span class="dropdown" style="direction:ltr;padding:0;">
		<button id="${id}" data-value="${symbol}"
				class="dropbtn" onclick="toggleDropdownContent(this, true)"
				style="padding:0;background-color:transparent;color:black;font-size:22px;">
			${symbol}
		</button>
		<div class="dropdown-content" style="">${options}</div>
		<img id="${id}-progress" src="images/loading.gif" 	
			style="display:none;width:16px;">
		</img>
		<img id="${id}-play-progress" src="images/playprog.gif"
			style="display:none;width:26px;">
		</img>
	</span>`;
}

function playTafsir(verseKey){
	var isPlayTafsir = $("#chkTafsir").prop('checked');
	if(isPlayTafsir && parent.playText){
		
		var opt = $("#tafsir-options").val();
		if(opt !== null && opt !== "none"){
			stopPlayVerse();
			$("#chkQir").prop('checked', '');
			var lang = opt.substring(0,2);
			
			var verse = verseKey.split(":");
			var tafsirElement = $(`#div${verse[0]}_${verse[1]}_tafsir`);
			if(tafsirElement.length == 0){
				return;
			}
			var text = tafsirElement.html(); 	
			if(text && text != '' && text != null){
				parent.playText(text, lang === 'ur' ? 'ur-PK':
									lang === 'ar' ? 'ar-SA': 'en-US');
			}
		}		
	}
	else
	{
		stopPlayVerse();
	}
}

//https://www.truemuslims.net
function loadQuranPdfOptions(){
	
	var languages = ["Arabic", "French-Quran", "Dutch-Quran", "Gujarati-Quran", "Hindi-Quran", "Kashmiri-Quran", "Malayalam-Quran", "Persian-Quran", "Tamil-Quran", "Sindhi-Quran", "Urdu-Quran"];
	var options = '';
	
	languages.forEach(function(lang){
		var l = lang === "Arabic" ? "arabic": lang;
		var url = `https://www.truemuslims.net/PDF-quran-in-all-languages/${l}.pdf`;
		options += isOS("Android") ?
				`<a href="#" onclick="
					var w = parent.window ? parent.window : window; 
					w.open('${url}');"></a>`
				:
				`<a href="${url}" onclick="
					var w = parent.window ? parent.window : window; 
					w.openInline(this.href); return false;">${lang}</a>`;
		return true;
	});
	
	$("#qPDF").html($(options));
}

function shareExternal(title, parameters){
	if (navigator.share) {
	  var url = getLocationPath()+"?"+parameters.join('&')
	  const shareData = {
		title: title,
		text: 'Here is an interesting verse for you:',
		url: url
	  };

	  // Trigger the share menu
	  navigator.share(shareData)
		.then(() => console.log('Shared!'))
		.catch((error) => console.error('Error sharing content:', error));
	} 
	else {
	  console.error('Web Share API is not supported on this browser.');
	}
}

function init_data_cache(){
	return {
		"adjectiveData": {
			path: "data/grmr/adjective.json"
		},
		"adverbData": {
			path: "data/grmr/adverb.json"
		},
		"isearchData": {
			path: "data/isearch.json"
		},
		"mappingsData": {
			path: "data/ar.dic/mapping.json"
		},
		"masdarData": {
			path: "data/grmr/masdar.json"
		},
		"verbTypeData": {
			path: "data/grmr/verbtypes.json"
		},
		"objectEffectsData": {
			path: "data/grmr/objecteffects.json"
		},
		"qsurahData": {
			path: "data/qrn/qsurah.zip"
		},
		"similarAyahData": {
			path: "data/qrn/similar-ayah.json"
		},
		"transliterationData": {
			path: "data/qrn/enwbwayah.zip"
		},
		"posRulesData": {
			path: "data/grmr/pos.json"
		},
		"cmpData": {
			path: "data/grmr/cmp.json"
		},
		"qfllistData":{
			path: "data/qrn/qf-list.json"
		},
		"noto-sans-font":{
			path: "styles/NotoSansSerif.ttf"
		},
		"ai-prompts":{
			path: "data/ai-prompts.json"
		},
		"def-data":{
			path: "data/grmr/defs.json"
		},
		"verb-examples":{
			path: "data/grmr/verb-ex.json"
		},
		"pronouns":{
			path: "data/grmr/pronouns.json"
		},
		"API_POS": {
		}
	};
}

function convertHTMLtoPDF(selector, filter, pdfFileName) {

	require(["scripts/jsPDF/polyfills.umd.js","scripts/jsPDF/jspdf.umd.js"], 
	function(pf, ns){
        const doc = new ns.jsPDF({ 
			orientation: "portrait", 
			unit: 'px',
			format: 'a4'
		});

		ensureJsonData({name: "noto-sans-font"})
		.then((font) => {
			doc.addFileToVFS('NotoSansArabic.ttf', font);
			doc.addFont('NotoSansArabic.ttf', 'NotoSans', 'normal');
			doc.setFont('NotoSans');
			doc.setFontSize(8);
			doc.text(5,5,'https://munawwaransari.github.io/alug/');
			doc.setFontSize(12);
			
			console.log(`query selctor: '${selector}'`);
			var elementHTML = document.querySelector(selector);
			if(selector.includes("iframe")){
				try
				{
					var idoc = elementHTML.contentDocument || elementHTML.contentWindow.document;
					elementHTML = idoc.querySelector('body');
				}
				catch(err){
					console.error(err.message);
					return;
				}
			}

			const oldFamily =  elementHTML.style.fontFamily;
			elementHTML.style.fontFamily = 'NotoSans';
			elementHTML.style.wordSpacing = "2px";

			if (filter) {
				const elementFilter = document.querySelector(filter);
				if(elementFilter){
					elementFilter.style.fontFamily = 'NotoSans';
				}
			}

			// Use the html() method to render the HTML element
			doc.html(elementHTML, {
				callback: function(doc) {
					// Save the PDF with a specific filename
					doc.save(pdfFileName);
					elementHTML.style.fontFamily = oldFamily;
				},
				margin: [10, 10, 10, 10], // Optional: add margins [top, right, bottom, left]
				autoPaging: 'text', // Handles multi-page content automatically
				x: 0,
				y: 0,
				width: doc.internal.pageSize.getWidth(), // Target width in the PDF document
				windowWidth: window.width ?? 675 // Window width in CSS pixels for accurate rendering
			});
		});
	});
}

function convertHTMLtoImage(selector, filters, imgFileName){
	require(["scripts/jsPDF/polyfills.umd.js","scripts/jsPDF/jspdf.umd.js"], 
	function(pf, ns){
        const doc = new ns.jsPDF({
			 orientation: "portrait", 
			 unit: 'px',
			 format: 'a4'
		});

		ensureJsonData({name: "noto-sans-font"})
		.then((font) => {
			doc.addFileToVFS('NotoSansArabic.ttf', font);
			doc.addFont('NotoSansArabic.ttf', 'NotoSans', 'normal');
			doc.setFont('NotoSans');

			var elementHTML = document.querySelector(selector);
			if(selector.includes("iframe")){
				try
				{
					var idoc = elementHTML.contentDocument || elementHTML.contentWindow.document;
					elementHTML = idoc.querySelector('body');

					var svg = elementHTML.querySelector('svg');
					if(svg.length > 0){
						alert('Convert to SVG');
						return;
					}
				}
				catch(err){
					console.error(err.message);
					return;
				}
			}

			const oldFamily =  elementHTML.style.fontFamily;
			elementHTML.style.fontFamily = 'NotoSans';

			if (filters && filters.length > 0) {
				$(filters[0]).css('fontFamily', 'NotoSans');
			}
			var backupDisplay = undefined;
			if (filters && filters.length > 1) {
				backupDisplay = $(filters[1]).css('display');
				$(filters[1]).css('display', 'none');
			}

			convertElementToImage(elementHTML, null, function(img){
				require(["scripts/jsPDF/jspdf.umd.js"], function (ns) {
					const doc = new ns.jsPDF({
						orientation: "portrait",
						unit: 'px',
						format: 'a4'
					});
					const imgProps = doc.getImageProperties(img);

					// log page sizes
					console.log(`convertElementToImage: page Size = ${doc.internal.pageSize.getWidth()} x ${doc.internal.pageSize.getHeight()}`);
					console.log(`convertElementToImage: image size = ${imgProps.width} x ${imgProps.height}`);

					doc.setFontSize(8);
					doc.text(doc.internal.pageSize.getWidth() - 120,
						5,
						'https://munawwaransari.github.io/alug/');

					// Calculate best fit
					var xMargin = 10, yMargin = 10;
					var pageWidth = doc.internal.pageSize.getWidth() - xMargin * 2;
					var pageHeight = doc.internal.pageSize.getHeight() - yMargin * 2;
					var pageRatio = pageWidth / pageHeight;
					var imgWidth = imgProps.width * pageRatio;
					var imgHeight = imgProps.height * pageRatio;
					var imageToPageRatio = 1;
					var imgW, imgH, posX = 0;
					if (imgHeight <= pageHeight) {

						imageToPageRatio = pageWidth / imgWidth
					}
					else if (imgWidth <= pageWidth) {
						imageToPageRatio = pageHeight / imgHeight;
					}
					else if (imgHeight < imgWidth) {
						imageToPageRatio = pageWidth / imgWidth;
					} else {
						imageToPageRatio = pageHeight / imgHeight;
					}
					imgW = imgWidth * imageToPageRatio;
					imgH = imgHeight * imageToPageRatio;
					if ((pageWidth - imgW) >= 0) {
						posX = (pageWidth - imgW) / 2;
					}
					doc.addImage(img,
						"PNG",
						xMargin + posX,
						yMargin,
						imgW,
						imgH);
					doc.save(imgFileName);
					elementHTML.style.fontFamily = oldFamily;
					if (backupDisplay) {
						$(filters[1]).css('display', backupDisplay);
					}
				});
			});
		});
	});
}

function convertElementToImage(element, opt, cb) {
  	require(["html2canvas.js"], function(html2canvas){
		//hide pin icon
		var pinImg = $(element).find("img[alt='Pin to Dashboard']");
		if(pinImg.length > 0 && pinImg.is(":visible")){
			pinImg.hide();
		}else{
			pinImg = undefined;
		}
		html2canvas(element)
		.then(canvas => {				
			const img = new Image();
			img.src = canvas.toDataURL("image/png"); 
			if(opt && opt.crop){
				console.log(`crop options: id:${opt.eId}, opt.useX: ${opt.useX}, opt.useY: ${opt.useY}`);
				img.onload = () => {
					const cropped = cropCanvas(img, 
						opt.useX ? opt.cropRect.x : 0, 
						opt.useY ? opt.cropRect.y : 0,
						opt.cropRect.width,
						opt.cropRect.height);
		
					//document.body.appendChild(cropped);
					const img2 = new Image();
					img2.src = cropped.toDataURL('image/png');
					if(cb){
						cb(img2);
					}
				};
			}else{
				if(cb){
					cb(img);
				}
			}

			//reenable icon
			if(pinImg){
				pinImg.show();
			}
		});
	});
}

function cropCanvas(source, sx, sy, width, height) {
    // 1. Create a new, temporary canvas element
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');

    // 2. Set the canvas dimensions to match the target crop size
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    // 3. Draw the sub-region of the source onto the new canvas
    ctx.drawImage(
        source, 
        sx, sy,       // Source crop position
        width, height, // Source crop dimensions
        0, 0,          // Destination placement position
        width, height  // Destination placement dimensions
    );

    return croppedCanvas;
}

function getPromptsForVerse(chapter, verse, target = 'puter') {
	var selLang = parent.getLang ? parent.getLang() ?? 'EN' : 'EN';
	var selWord = "${$('.sel-word').first().text()}";
	var prompts = getPromptFromKey(
		["Conjugation", "WordPrompt", "VersePrompt", "VerseErab", "VerseHadithReferencePrompt", "VerseToImage", "VerseTranslate"],
		{
			"0": [selWord, selLang],
			"1": [selWord, selLang],
			"2": [chapter, verse, selLang],
			"3": [chapter, verse, selLang],
			"4": [chapter, verse, selLang],
			"5": [chapter, verse, selLang],
			"6": [chapter, verse]
		});

	var word_conjugation_prompt = prompts[0];
	var word_promtp = prompts[1];
	var verse_prompt = prompts[2];
	var verse_erab_prompt = prompts[3];
	var verse_hadith_reference_prompt = prompts[4];
	var verse_to_image_prompt = prompts[5];
	var verse_translate_prompt = prompts[6];
	var target_function = target == 'puter' ? 'loadPuterSearch' : 'openGoogleAISearch';
	return`
		<a href="#" onclick="${target_function}(\`${word_promtp}\`)">Describe word</a>
		<a href="#" onclick="${target_function}(\`${word_conjugation_prompt}\`)">Conjugate word</a>
		<a href="#" onclick="${target_function}(\`${verse_prompt}\`)">Summarize verse</a>
		<a href="#" onclick="${target_function}(\`${verse_erab_prompt}\`)">Explain Erabs</a>
		<a href="#" onclick="${target_function}(\`${verse_hadith_reference_prompt}\`)">Hadith reference</a>
		<a href="#" onclick="${target_function}(\`${verse_to_image_prompt}\`)">Visualize Verse</a>
		<a href="#" onclick="${target_function}(\`${verse_translate_prompt}\`)">Translate in 10 languages</a>
		`
		.trim();
}

function getPromptFromKey(promptKeys, paramsDict, useSelLang) {
	var data = parent.dataCache["ai-prompts"];
	if (!data && !data.data) {
		console.error("Error loading AI prompt:", promptKey);
		return [];
	}
	var prompts = [];
	data = data.data;
	promptKeys.forEach((promptKey, pIndex) => {
		if (data[promptKey]) {
			var prompt = data[promptKey].join("\n").trim();
			var params = paramsDict[`${pIndex}`];
			if (params && params.length > 0) {
				params.forEach((p, index) => {
					if (Array.isArray(p)) {
						prompt = prompt.replaceAll(`@${index}`,
							p.map(t => `- ${t}`).join("\n"));
					} else {
						prompt = prompt.replaceAll(`@${index}`, p);
					}
				});
			}
			if (useSelLang) {
				prompt += '\nProvide Final response in language: ' + parent.getLang();
			}
			prompts.push(prompt);
		}
		else {
			prompts.push("Prompt not found for key: " + promptKey);
		}
	});
	return prompts;
}

function openGoogleAISearch(prompt, useSelLang){
	if(useSelLang){
		prompt += '\n Provide Final response in language: '+ parent.getLang();
	}
	
	var url = `https://www.google.com/ai?q=${encodeURIComponent(prompt)}`;
	window.open(url, '_blank');
}

function loadPuterSearch(prompt){
	console.log("loadPuterSearch");
	if(parent.redirect){
		parent.redirect(
			"ai.html", 
			"", 
			prompt ? prompt : ''
		);
	}
}

function loaDashboard(){
	console.log("loadPuterSearch");
	if(parent.redirect){
		parent.redirect(
			"dashboard.html", 
			"", 
			''
		);
	}
}

function openQuranCorpus(chapter, verse){
	var url = `https://corpus.quran.com/treebank.jsp?chapter=${chapter}&verse=${verse}`;
	window.open(url, '_blank');
}

function toggleHead(divEl, imgEl){
	if(divEl)
		divEl.toggle();
	if(imgEl){
		if(imgEl.prop('src').endsWith("up.png"))
			imgEl.prop('src', 'images/dn.png');
		else
			imgEl.prop('src', 'images/up.png');
	}
}

function togglePreviewImages(previewContainer, imageContainer, overlayOption){
	var isVisible = $(previewContainer).is(':visible');
	if(isVisible){
		$(previewContainer).css('display', 'none');
		$(imageContainer).show();
		return;
	}
	var images = $(imageContainer).find("img[src!='']");
	if(images.length == 0){
		console.log("No images found to preview");
		$(previewContainer).css('display', 'none');
		$(imageContainer).show();
		return;
	}
	$(previewContainer).attr('data-count', images.length);
	if(overlayOption){
		$(previewContainer).attr('data-overlay', overlayOption);
	}
	$(previewContainer).attr('data-index', -1);
	nextPreviewImage(previewContainer, imageContainer);
	$(previewContainer).css('display', 'flex');
	$(imageContainer).hide();
}

function setRevealAnswer(previewContainer, el, title, overlayOption) {
	el.html(`
		<p style="cursor:pointer;font-weight:bold;" 
			onclick="
			$(this).text('${title}'); 
			if('${overlayOption}' == 'bottom'){
				$('.ioverlay-bottom').remove();
			}else if('${overlayOption}' == 'top'){
				$('.ioverlay-top').remove();
			}else if('${overlayOption}' == 'bottom-top'){
				$('.ioverlay-bottom').remove();
				$('.ioverlay-top').remove();
			}
		">
		?
		</p>`);

	$(".ioverlay-bottom").remove();
	$(".ioverlay-top").remove();
	$(".ioverlay-bottom").remove();

	if (overlayOption == "bottom") {
		$(previewContainer).append(`
				<div class="ioverlay-bottom"></div>
			`);
	}else if (overlayOption == "top") {
		$(previewContainer).append(`
				<div class="ioverlay-top"></div>
			`);
	} else if (overlayOption == "bottom-top") {
		$(previewContainer).append(`
				<div class="ioverlay-bottom"></div>
				<div class="ioverlay-top"></div>
			`);
	}		
}

function nextPreviewImage(previewContainer, imageContainer){
	var count = parseInt($(previewContainer).attr('data-count'));
	var index = parseInt($(previewContainer).attr('data-index'));
	var overlayOption = $(previewContainer).attr('data-overlay');
	if(isNaN(count)) count = 0;
	if(isNaN(index)) index = -1;
	if(count > 0){
		var images = $(imageContainer).find("img[src!='']");
		index++;
		if(index >= count) index = 0;
		var img = $(previewContainer).find('img').first();
		img.prop('src', $(images[index]).prop('src'));
		var title = $(images[index]).prop('title');
		setRevealAnswer(previewContainer, img.prev(), title, overlayOption);
		$(previewContainer).attr('data-index', index);
	}
}

function prevPreviewImage(previewContainer, imageContainer){
	var count = parseInt($(previewContainer).attr('data-count'));
	var index = parseInt($(previewContainer).attr('data-index'));
	var overlayOption = $(previewContainer).attr('data-overlay');
	if(isNaN(count)) count = 0;
	if(isNaN(index)) index = -1;
	if(count > 0){
		var images = $(imageContainer).find("img[src!='']");
		index--;
		if(index < 0) index = count - 1;
		var img = $(previewContainer).find('img').first();
		img.prop('src', $(images[index]).prop('src'));
		var title = $(images[index]).prop('title');
		setRevealAnswer(previewContainer, img.prev(), title, overlayOption);
		$(previewContainer).attr('data-index', index);
	}
}

function addImagePreviewer(containerName, overlayOption){
	
	var html = `
		<div class="image-prev" 
			 style="height:100%;float:left;background-color: #bbb;font-size:40px;align-content: space-around;cursor:pointer;"
			 onclick="prevPreviewImage('.image-preview','#${containerName}');">
		<b>&lt;</b>
		</div>
		<div style="width: 100%; height:100;align-items: center;justify-content: center;">
			<div style="text-align:center;width:100%;height: auto; margin: auto; padding: 10px; font-size:20px;">Title</div>
			<img style="width: 100%; height: auto; margin: auto; object-fit: contain; max-height: 400px;"/>
		</div>
		<div class="image-next" 
			 style="height:100%;float:right;background-color: #bbb;font-size:40px;align-content: space-around;cursor:pointer;"
			 onclick="nextPreviewImage('.image-preview','#${containerName}');">
		<b>&gt;</b>
		</div>
	`;
	$(".image-preview").html(html);

	var iconHtml = `
		<a href="#" style="text-decoration: none;" title="Preview Images" 
			onclick=" togglePreviewImages('.image-preview','#${containerName}', '${overlayOption}');">
			<img src="images/lookup.jpg" style="width: 20px; height: 16px; margin-left: 2px;" />
		</a>
	`;
	$(iconHtml).insertAfter($(".image-preview").prev());
}

function getRandomIndices(arr){
	var indices = Array.from({length: arr.length}, (_, i) => i);

	// Fisher-Yates shuffle algorithm to randomize the indices
	for (let i = indices.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[indices[i], indices[j]] = [indices[j], indices[i]];
	}
	return indices;
}

function listQListItems(el, listId){
	if(listId){
		var list = $(listId+" option");
		var div = $(el);
		div.empty();
		var container = '<div style="width:90%;display: flex; flex-wrap: wrap;gap: 10px;">';
		container += `<div style="width:100%; height:50px;">&nbsp;</div>`;
		list.each(function(index, element) {
			var value = $(this).val();  // Get option value
			var text = $(this).text();  // Get visible text
			
			if(text && text.trim() === 'ALL') return true; // Skip
			
			container += `
			<div style="height: fit-content;width: 160px; padding:10px;cursor:pointer;border: 1px solid #ccc;border-radius: 5px;box-shadow: 2px 2px 5px rgba(0,0,0,0.1);"
				onclick="listExamplesFromQuran('${value}');">
			${text}
			</div>`;
			//console.log('Index: ' + index + ' | Value: ' + value + ' | Text: ' + text);
		});
		container += '</div>';
		div.append($(container));
	}
}

function listListItems(el, listId, page, action){
	if(listId){
		var list = $(listId);
		var div = $(el);
		div.empty();
		var container = `
		<div style="width:90%;display: flex; flex-wrap: wrap;gap: 10px;">
		<div style="height:20px;width:100%;padding:10px;text-align:center;vertical-align:middle">
			<b>${getActionTitle(action)}</b>
		</div>`;
		var sortedList = [], lookupText={};
		list.each(function(index, element) {
			var value = $(this).val();  // Get option value
			var text = $(this).text();  // Get visible text
			
			if(text && text.trim() === 'Show All') return true; // Skip
			
			console.log(`val:${value}, text=${text}, index: ${index}`);
			var txt = text.replace(/\(.*\)/ig,'');
			sortedList.push(txt);
			lookupText[txt] = {val: text, pos: index};
		});
		sortedList.sort();
		$.each(sortedList, function(index, text) {
			var txt = lookupText[text].val;
			var pos = lookupText[text].pos;
			container += `
			<div style="height: fit-content;width: 160px; padding:10px;cursor:pointer;border: 1px solid #ccc;border-radius: 5px;box-shadow: 2px 2px 5px rgba(0,0,0,0.1);"
				onclick="if(parent) {
						parent.redirect('${page}', '${action}', 'pos:${pos}');
					}">
			${txt}
			</div>`;
		});
		container += '</div>';
		div.append($(container));
	}
}

function getListButtinWithSelect(sel, filterClass, compareType) {
	return `
	<div class="nFilterDiv">
		${sel}
		<br style="height:1px;padding:0;margin:0;"/>
		<button class="nFilterBtn"
				onclick="listListItems('.dictionary',
										'.${filterClass} option', 
										'dict.html', 
										'${getActionFromCompareType(compareType)}')"
			>List</button>
	</div>`;
}

function getActionTitle(action){
	return  action == 'masdar'? 'Verbal Nouns':
	action == 'vtab-all' ? 'Verbs':
	action == 'obj-effect' ? 'Object Effects':				 
	action == 'noun-pat'? 'Noun Patterns' : 
	action == 'noun-cmp'? 'Nouns' : 
	action == 'cmp'? 'Particles' : 
	action == 'adj'? 'Adjectives' : 
	action == 'adv'? 'Adverbs' : 
	action == 'prep'? 'Prepositions' : 
	action == 'prep-ph'? 'Prepositional Phrases' : 
	action == 'imp-verb'? 'Imperatives' : 
	action == 'weak-verb'? 'Weak Verbs' :
	action == 'inad-verb' ? 'Inadequate Verbs':
	action;
}

function getActionFromCompareType(compareType){
	return compareType == 'noun'? 'noun-cmp': 
	compareType == 'verb'? 'vtab-all':
	compareType == 'adjectiveData'? 'adj':
	compareType == 'adverbData'? 'adv':
	compareType == 'objectEffectsData'? 'obj-effect':
	compareType == 'masdarData'? 'masdar':
	compareType == 'verbTypeData'? 'verbType':
	compareType ?? 'cmp';
}

function getFreeImageSource(keyword, url="https://loremflickr.com/360/480/"){
	return `${url}${keyword}`;
}

function delSelectedCardFromDashboard(){
	if(parent.dashboard){
		var selCard = $(".dbcard-select");
		if(selCard.length == 1){
			var dashboard = parent.dashboard;
			var id = selCard.prop('id');
			if(dashboard.cards[id]){
				dashboard.cards[id].html = 'DELETED';
			}
		}
	}
}

function addNewCardToDashboard(source){
    if(parent.dashboard){
		var dashboard = parent.dashboard;
		var id=`dbcard${dashboard.count+1}`;
		
		// // adjust styles
		// if(source && source.startsWith("<img ")){
		// 	source = source.replace('<img ', '<img style="max-width:auto;height:auto;display:block;" ')
		// }
		dashboard.cards[id]={
			id: id,
			num:dashboard.count+1,
			html: source,
			settings: {
				"size": "fit-content",
				"float": "none"
			}
		};
		dashboard.count++;
	}
}

function getPinIcon(id, subId, doc){
	return doc.getElementById('dbrd').style.display != "none" ?
	`&nbsp;
	<a style="float:right;">
		<img alt="Pin to Dashboard" 
		        class="pinIcon"
				src="images/pin.png"
				onclick="convertElementToImage($('#${id}')[0],
					{
						'eId': '${id}',
						'crop': true, 
						'cropRect': $('#${id}${subId}')[0].getBoundingClientRect(),
						'useX': /.?Table/.test('${id}')
					},
					(img)=>{addNewCardToDashboard(img.outerHTML)})"/></a>`
	:'';
}

////////////////////////////////////////////////////////////////////////////
function processSelectedWordPos(word, cb){
	getPosLookups()
	.then((lookups)=>{
		var apiObj = lookups.apiObj;
		var w = word;	
		var w2 = apiObj.removeDiacritics(w);
		
		console.log(`w:${w}, w2:${w2}`);
		var pronouns = [], nouns = [], verbs = [], particles = [], prefixes = [], suffixes = [];

		var res = procObviousNounEndings(w, w2, apiObj);
		nouns = res.res; w = res.w; w2 = res.w2;

		if(w !== '')
		{
			prefixes = ['ب', 'ف', 'و', 'ل', 'ال','أل', 'ٱل'] //'ك'
			.filter(x => w2.match(`^${x}`) && !w2.endsWith("ا"));

			if(prefixes.length > 0){
				w = removePrefix(w, prefixes[0]);
				w2 = apiObj.removeDiacritics(w);
				console.log(`w:${w}, w2:${w2}`);

				if(prefixes.filter(x => x == 'ف' || x == 'ب' || x == 'ل').length > 0){
					res = procObviousPronouns(w, w2, apiObj, lookups);
					pronouns = res.res; w= res.w; w2=res.w2;

					if(pronouns.length > 0 && (pronouns[0] == w2 || pronouns[0] == 'ى')){
						particles.push(prefixes[0]+pronouns[0]);
						prefixes = [];
						pronouns = [];
						w = '';
					} else if(w2 == 'ي' || w2 == 'ى'){
						particles.push(prefixes[0]+w2);
						prefixes = [];
						w = '';
					}
				}
				else if(prefixes.filter(x => x == 'أل' || x == 'ال' || x == 'ٱل').length > 0){
					if(w2 == 'له'){
						w = 'ا'+w2;
					}
					nouns.push(w);
					w = '';
				}
			}

			if(w != ''){
				if(prefixes.length == 0){
					var res = procObviousParticles(w, w2, apiObj, lookups); 
					particles = res.res; w = res.w; w2 = res.w2;
				}

				if(w != ''){
					res = procObviousPronouns(w, w2, apiObj, lookups);
					pronouns = [...pronouns,...res.res]; w= res.w; w2=res.w2;

					if(w != '' && prefixes.length == 0 && particles.length == 0){
						res = procObviousParticles(w, w2, apiObj, lookups); 
						particles = res.res; w = res.w; w2 = res.w2;
					}
				}
			}

			if(w != ''){
				if(nouns.length == 0 && verbs.length == 0)
				{
					// Nooun prefix
					if(w.startsWith('يَٰ') || w2.startsWith('يا')){
						prefixes.push('يا');
						w = removePrefix(w, 'يَٰ');
						w = removePrefix(w, 'يا');
						nouns.push(w);
						w = '';
					}

					if(pronouns.length > 0 && pronouns[0].startsWith('ك')){
						nouns.push(w);
						w = '';
					}

					var verbPrefix = ['ي','ت','ا'].filter(x => w2.startsWith(x));
					var verbSuffix1 = ["ون", "ان", "ين", "ن"].filter(x => w2.endsWith(x));
					var verbSuffix2 = ["ني", "تني", "نا", "ت"].filter(x => w2.endsWith(x));

					if(w != '' && verbPrefix.length > 0 && pronouns.length > 0)
					{
						var r = removePrefix(w, verbPrefix[0])
						r = apiObj.removeDiacritics(r);
						if(r.length < 3 && pronouns[0] == "ي"){
							w += pronouns[0];
							pronouns = [];
							verbs.push(w);
							w = '';
						}
						else if(r.length >= 3){
							w += pronouns[0];
							verbs.push(w);
							w = '';
						} 
					}
					if(w != '' && verbPrefix.length >0 && verbSuffix1.length >0){
						var r = removePrefix(w, verbPrefix[0]);
						r = removeSuffix(w, verbSuffix1[0]);
						if(apiObj.removeDiacritics(r).length > 2){
							verbs.push(w);
							w ='';
						} 
					}
					if(w != '' && verbPrefix.length==0 && verbSuffix2.length > 0){
						var r = removeSuffix(w, verbSuffix2[0]);
						if(apiObj.removeDiacritics(r).length > 2){
							verbs.push(w);
							w = '';
						}
					}
					if(w != ''){
						if(particles.length > 0 || prefixes.length > 0){
							nouns.push(w);
							w = '';
						}
						else{
							suffixes = ["ون", "ان", "ين", "ات", "تي", "ةَ"].filter(x => w2.endsWith(x));
							if(suffixes.length > 0){
								nouns.push(removeSuffix(w2, suffixes[0]));
								if(suffixes[0] !== "تي" && suffixes[0] !== "ةَ"){
									nouns.push("plural");
								}
								w = '';
							}
							else{
								nouns.push(w);
								nouns.push('noun or verb');
								w = '';
							}
						}
					}
				}
			}
		}

		if(cb)cb({
			word: word,
			prefixes: prefixes,
			suffixes: suffixes,
			verbs: verbs,
			nouns: nouns,
			pronouns: pronouns,
			particles: particles
		});
	});
}

function procObviousPronouns(w, w2, apiObj, lookups){
	var pr = lookups.pronouns.map(x => x.replaceAll('ـ',''))
			.filter(x => w.endsWith(x) || 
						w2.endsWith(apiObj.removeDiacritics(x)));

	if(pr.length > 0){
		w = removeSuffix(w2, apiObj.removeDiacritics(pr[0]));
		w2 = apiObj.removeDiacritics(w);
		console.log(`w:${w}, w2:${w2}`);
	}

	return {w:w, w2:w2, res: pr};
}

function procObviousParticles(w, w2, apiObj, lookups){
	var part = lookups.particles
	.filter(x => w == x || apiObj.removeDiacritics(w) == (apiObj.removeDiacritics(x)));

	if(part.length > 0){
		w = removeWord(w, part[0]);
		w2 = apiObj.removeDiacritics(w);
		console.log(`w:${w}, w2:${w2}`);
	}
	return {w:w, w2:w2, res: part};
}

function procObviousNounEndings(w, w2, apiObj){
	// check for obvious noun endingd
	var nouns = [];
	var nounEndings = ["ًا", "ً", "ٌ", "ٍ", '\u065E', "\u064E\u06E2ا"].filter(x => w.endsWith(x));
	if(nounEndings.length > 0){
		w = removePrefix(w, nounEndings[0]);
		w2 = apiObj.removeDiacritics(w);
		console.log(`w:${w}, w2:${w2}`);

		nouns.push(w);
		if(nounEndings[0].endsWith("\u064E\u06E2ا") || nounEndings[0].endsWith("ًا"))
		{
			nouns.push("masdar");
		}else{
			nouns.push("munsarif");
		}
	}
	return { w: w, w2: w2, res: nouns};
}

function getPosLookups(){
	return new Promise(function(resolve, reject){
		var lookups = {};
		var w = $(".word-ar.sel-word:first").text().trim();	
		ensureJsonData({name: "posRulesData"})
		.then((data1)=>{

			var apiObj = parent.dataCache["API_POS"].data;
			lookups.apiObj = apiObj;

			if(apiObj){
				// get particle lookup
				var partData = data1["Harf"].matches;
				var partLookup = [];
				Object.keys(partData)
				      .every((k)=>{
						if(k != "ignore"){
							var wArray = partData[k].words.map(x => x.split('/')).flat()
							partLookup = [...partLookup,...wArray];
						}
						return true;
					  });
				lookups.particles = partLookup.map(x=>
					x.split(' ').length > 1 ? '': x.replace(/\(.*\)/,'').trim())
				.flat()
				.map(x => x.split('..'))
				.flat()
				.filter(x=>x != '')
			}
			
			// get pronoun lookup
			ensureJsonData({name: "pronouns"})
			.then((data)=>{
				lookups.pronouns = [
					...new Set(data.pronouns.map(x => x.names).flat()
					)];

				resolve(lookups);
			});
		});
	});
}

function makeErabOptional(str, opt){
  var regEx = "";
  if(!str) return regEx;
  for (const code of str) {
	if(!(0x0600 <= code <= 0x06FF)){
		regEx += `${code}?`;
	}else{
		regEx += code;
	}
  };
  return opt == 'pfx' ? `^(${regEx})`:
		 opt == 'sfx' ? `(${regEx})$`:
		 opt == 'word'? `^(${regEx})$`: `(${regEx})`;
}

function removeWord(word, str){
	var w = word;
	if(w){
		return w.replace('\u06E1','')
			.replace(new RegExp(makeErabOptional(str.replace('\u06E1',''), 'word'),"g"), '');
	}
	return word;
}

function removePrefix(word, prefix){
	var w = word;
	if(w){
		return w.replace(new RegExp(makeErabOptional(prefix, 'pfx'),"g"), '');
	}
	return word;
}

function removeSuffix(word, suffix){
	var w = word;
	if(w){
		return w.replace(new RegExp(makeErabOptional(suffix, 'sfx'),"g"), '');
	}
	return word;
}
