//
//	Author: munawwar_ali@yahoo.com
//

const RETRY_DELAY = 400;
var loadRetryCount = 5; 
var lastiSearchSuggestionInput;
var dataCache = init_data_cache();
var action_history = {};

$(document).ready(function()
{	
	var queryAcion = getParamValue("query");
	if(queryAcion && queryAcion.length > 0){
		var response = undefined;
		switch(queryAcion){
			case "actions":
				response = [
					"tools",
					"pFunctions"
				];
			break;

			case "tools":
				response = [];
				$.each($(".toolSpan img"), function(i, img){
					response.push(img.id);
					return true;
				});
			break;

			case "pFunctions":
				response = [
					"changeAudioTime",
					"getAllVoices",
					"getLang",
					"getLangOption",
					"isLangSupported",
					"isAutoPlayEnabled",
					"openInline",
					"pauseAudio",
					"playAudio",
					"playTextAll",
					"stopAudio",
					"resumeAudio",
					"redirect",
					"updateStates"
				];
			break;

			default:
				response = {"error": `Invalid query action, try 'actions'` };
			break;
		}		
		window.document.writeln(JSON.stringify(response));
		window.stop();
		return false;
	}

	if(isOS("Android")){
		setTimeout(function(){
			if(speechSynthesis && speechSynthesis.onvoiceschanged)
				speechSynthesis.onvoiceschanged();
		}, 200);
	}
	
	$(".tool").on('click', function(){
		updateToolDescription(event.target.id);
	});
	
	window.onresize = updateDeviceSize;
	updateDeviceSize();
	function updateDeviceSize(){
		var deviceType = getDeviceType();
		$(".toolDiv").removeClass('mobile pad desktop');
		$(".toolDiv").addClass(deviceType);
		console.log(deviceType);
		window.onresize = undefined;
	}
	
	nodeInserted("#languages");
	$(document).on("nodeInserted",function(e,q){
		isLangLoaded = true;
		console.log('lang node inserted.')
		if (q === "#languages"){
			$("#languages").parent().hide();
			loadVoiceOptions(true, false);
			updateVoiceSelection();
			
			// set support options
			var arVoices =  $("#languages option").filter(function(i, x){
				return x.value === 'ar-SA' || x.value === 'ar_SA';
			});
			var urVoices = $("#languages option").filter(function(i, x){
				return x.value === 'ur-PK' || x.value === 'ur_PK' ||
					   x.value === 'ur-IN' || x.value === 'ur_IN';
			});
			arSupported = arVoices.length >  0;
			urSupported = urVoices.length >  0;
		}
		$("#text").text("");
		$("#play").click();
		
		// Load initial page
		var theme = getParamValue("theme");
		if(theme && theme !== ""){
			app_theme = "theme-"+theme;
			$("body").addClass(app_theme);
		}
		var mode = getParamValue("mode");
		app_mode = mode ?? 'default';

		if(app_mode === 'Quran'){
			$("#imgHead").hide();
			$(".toolDiv").hide();
		}else{
			$(".toolDiv").show();
		}

		var noTools = getParamValue("no-tools");
		var tools = getParamValue("tools");
		showHideTools(noTools, tools);
		
		var tf = getParamValue("tf");
		var sval = getParamValue("search");
		var searchVal = app_mode === 'Quran' ? (sval  ?? 'surahs') 
											 : decodeURI(getParamValue("search"));	
		if((tools && tools.includes("dict")) || (searchVal && searchVal != 'undefined')){
			var sval = getParamValue("search");
			if(tf !== undefined && tf !== '')
				loadQuranSearch(searchVal+"&tf="+tf, sval);
			else
				loadQuranSearch(searchVal, sval);
		}else{
			loadGrammarView();
			updateToolDescription('in-search');
			
			var query = decodeURI(getParamValue("q"));	
			if(query && query !== "undefined"){
				if(query === "sitemap"){
					genAndDownloadSitemap();
					return;
				}
				getiSearchSuggesstions(query, function(res){
					if(res){
						if(res.length > 1){
							var res2 = res.filter(x => !x.startsWith("..."));
							if(res2.length > 0)
								res = res2;
						}
						if(res.length > 0){
							$("#insearchtxt").val(res[0]);
							isearch();
						}
					}
				})
			}
			
		}
		
		$("#hd-loading").hide();
	});
	
	$("#text").text('');
	$("#text").hide();

	checkBrowserSupport();
	document.getElementById('playSections').addEventListener('change', function() {
		const selectedValue = this.value;
		$("#text").text(selectedValue);
		$("#play").click();
	});
	
	document.getElementById('lang-options').addEventListener('change', function(){
		langOption = this.value;
		$("#languages").val(langOption);
		console.log("lang option changed: "+ langOption);
		if(states.action == "quiz"){
			setTimeout(function(){
				openQuizV2(states.chapter, states.file, states.topic);
			}, 150);
			
		}
	});
});

function showHideTools(noTools, tools){
	if(noTools && noTools.length > 0){
		noTools.split(',').every(function(t){
			var tt = $(".toolSpan img[id^="+t+"]");
			if(tt && tt.length > 0){
				tt.hide();
			}
			return true;
		});
	}
	
	if(tools && tools.length > 0){
		tools.split(',').every(function(t){
		var tt = $(".toolSpan img[id^="+t+"]");
		if(tt && tt.length > 0){
			if(t.startsWith('sp')){
				$("#speech_2").show();
				toggleAutoplay();
			}else{
				tt.show();
			}
		}
		return true;
	});
	}
}

function updateVoiceSelection(){
	var lang = $("#lang-options").val();
	if(lang){
		
		states[lang] = {
			lang: $('#voice-options option:selected').attr('data-lang'), 
			dataIndex: $('#voice-options option:selected').val(), 
			selIndex: $('#voice-options').prop('selectedIndex'),
			options: states[lang].options
		};
		loadVoiceOptions(true, true);
		
		const event = new Event('onvoiceloaded');
		document.dispatchEvent(event);
	}	
}

function loadVoiceOptions(fill, clean){
	var l = $("#lang-options").val();
	if(states[l] == undefined){
		states[l] = {lang: l, dataIndex: 0, selIndex: 0, options: undefined};
	}
	if(states[l].options === undefined){
		var voices = $('#languages option[value^="'+l.substring(0,2)+'"]');
		if(voices.length > 0 && fill){
			var o = '';
			for(var i = 0; i < voices.length; i++){
				var val = voices[i].value + voices[i].index;
				var selected = states[voices[i].value] != undefined ? 
						(states[voices[i].value].selIndex === i ? " selected " : "") : "";
				o += `
				<option value="${voices[i].index}" ${selected} data-lang="${voices[i].value}">
					${voices[i].text}
				</option>`;
			}
			states[l].options = o;
		}
	}
	$("#voice-options").empty();
	$("#voice-options").append($(states[l].options));
	//select last index
	if(states[l].selIndex > -1){
		$("#voice-options").prop("selectedIndex", states[l].selIndex);
	}else{
		states[l].selIndex = $("#voice-options").prop("selectedIndex");
	}
	return voices;
}

function loadLanguages(){
	var l = $("#languages");
	l.empty();
	
	const event = new Event('onvoiceloaded');
	document.dispatchEvent(event);
};

			
function singInUser(){
	console.log("signIn");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "login.html"));
	}, 5);
}

function changeLanguageOption(lang){
	
	langOption = lang ?? langOption ?? "en-US";
	if( !lang && langOption == "ar-SA"){
		langOption = "en-US";
	}
		
	var selectElement = document.getElementById('lang-options');
	selectElement.value = langOption;
	var event = new Event('change');
	selectElement.dispatchEvent(event);	
}

function toggleAutoplay(){
	
	if(!speech_synthesis_supportd){
		$("#ss-support_2").show();
	}else{
		$("#ss-support_1").hide();
		$("#ss-support_2").hide();
		toggleIcon("#speech");
		autoplay = !autoplay;
		
		if(autoplay){
			$("#playSections").show();
			$("#play").show();
			updateStates({"speech": "Autoplay is now enabled!" });
		}else{
			$("#playSections").hide();
			$("#play").hide();
			updateStates({"speech": "Autoplay is now disabled!" });
		}
	}
	console.log('autoplay :' + autoplay);
}

function toggleMenu(){
	
	toggleIcon("#topics");
	menuOption = !menuOption;
	$(".menu-container").toggle();
}

function toggleIcon(id){
	[id+'_1', id+'_2'].forEach(function(id){
		$(id).toggle();	
	});
	
};

function loadResources(){
	console.log("loadResources");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "dresources.html"));
	}, 5);
}

function loadQuizResources(){
	console.log("loadQuizResources");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "quizres.html"));
	}, 5);
}

function loadDictionarySearch(text){

	console.log("loadDictionarySearch");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "dsearch.html?search="+text));
	}, 5);
}

function loadGrammarView(params){

	console.log("loadGrammarView");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		var path = "dict.html?";
		if(params){
			if(params["action"])
				path += "&action="+params["action"];
			if(params["data"])
				path += "&data="+params["data"];
		}
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + path));
	}, 5);
}

function loadQuranSearch(text, sval = ''){
	
	console.log("loadQuranSearch");
	$('.reading-pane').attr("src","");
	setTimeout(function(){

		//get lang pram value
		var selectElement = document.getElementById('lang-options');
		var lang = selectElement.value.substring(0,2);

		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "qsearch.html?search="+text+"&lang="+lang+"&mode="+app_mode));
	}, 5);
}

function showClock(){
	console.log("showChart: "+ name);
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "clock.html"));
	}, 5);
}

function showChart(sel){
	var name = $('#sel'+sel).val();
	console.log("showChart: "+ name);
	$('.reading-pane').attr("src","");
	var path = "";
	switch (sel){
		case "Vocab": path = 'cards.html?data='+name; break;
		case "Misc": path = name+'.html'; break;
		case "Chart": path = 'charts.html?folder='+name; break;
		case "TTS": path = 'tts.html';break;
		default: console.log('Error: invalid section');	return;
	}
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() +  path));
	}, 5);
}

//ref: https://stackoverflow.com/questions/7434685/how-can-i-be-notified-when-an-element-is-added-to-the-page
function nodeInserted(elementQuerySelector){
    if ($(elementQuerySelector).length===0){
		loadRetryCount--;
		if(loadRetryCount == 0){
			location.reload();
			return false;
		}
		console.log('Retrying: remaing attempts:'+loadRetryCount);
		setTimeout(function(){
            nodeInserted(elementQuerySelector);
        },RETRY_DELAY);
    }else{
        $(document).trigger("nodeInserted",[elementQuerySelector]);
    }
};

function updateToolDescription(id, opt){
	
	var lOption = $("#l-option-child");
	lOption = lOption.detach();
	if(id === "l-option"){
		$('#tool-description').empty();
		lOption.appendTo($('#tool-description'));
		lOption.show();
		return;
	}else{
		lOption.appendTo($('#l-option'));
		lOption.hide();
	}
	
	if(id !== "alpha"){
		updateStates({"menu": "hidden"});
	}

	var toolMessage = $("#tool-description");
	toolMessage.empty();
	toolMessage.show();
	$("#psHolder").hide();
	
	switch(id){
		case 'theme':
			var sdiv = $(`
			<div>Theme: 
				<select id="theme-options" onchange="changeTheme(this)">
					<option value="default" ${(app_theme === 'default' ?' selected ':'')}>Default</option>
					<option value="theme-dark" ${(app_theme === 'dark-theme' ?' selected ':'')}>Dark</option>
					<option value="theme-grayscale" ${(app_theme === 'grayscale-theme' ?' selected ':'')}+'>Grayscale</option>
					<option value="theme-saturation" ${(app_theme === 'saturation-theme' ?' selected ':'')}>Saturation</option>
					<option value="theme-sepia" ${(app_theme === 'sepia-theme' ?' selected ':'')}>Sepia</option>
				</select>
				&nbsp;Image: 
				<select id="bg-options" onchange="changeBackground(this)">
					<option value="default" ${(app_bg === 'default' ?' selected ':'')}>Default</option>
					<option value="bg-1" ${(app_bg === 'bg-1' ?' selected ':'')}>Background 1</option>
					<option value="bg-2" ${(app_bg === 'bg-2' ?' selected ':'')}>Background 2</option>
					<option value="bg-3" ${(app_bg === 'bg-3' ?' selected ':'')}>Background 3</option>
				</select>
			</div>`);
			toolMessage.html(sdiv);
			break;
			
		case 'ai':
		var sdiv = $(`
			<div  style="width:100%">AI Search</div>`);
			toolMessage.html(sdiv);
			loadPuterSearch();
		break;

		case 'dbrd':
		var sdiv = $(`
			<div  style="width:100%">Dashboard</div>`);
			toolMessage.html(sdiv);
			loaDashboard();
		break;

		case 'in-search':
			var sdiv = $(`
			<div>
				<input id="insearchtxt" class="isearch"/>
				<input type="reset" value="" alt="clear" title="Clear" onclick="$('#insearchtxt').val('');"/>
				<button id="isearchD" class="dropbtn"
					style="background-color:#6AA84F;top:-8px; height: 30px;margin-left:-18px;"
					onclick="isearch()">
				<b>Go!</b>
				</button>
			</div>`);
			toolMessage.html(sdiv);
			
			autocomplete(document.getElementById('insearchtxt'), function(val, callback){
				var condition = val.length > 1 && val !== lastiSearchSuggestionInput;
				if(val.length > 1 && val !== lastiSearchSuggestionInput){
					lastiSearchSuggestionInput = val;
					getiSearchSuggesstions(val, callback);
				}
				return condition;
			});
		break;
		
		case "info": 
		{
			toolMessage.html(states.info);
		}
		break;

		case "ss-support_1": 
		case "ss-support_2": 
		{
			toolMessage.html(states.ss_support);
		}
		break;
				
		case "speech_1": 
		case "speech_2": 
		{
			toolMessage.html(states.speech);
			if($("#playSections option").length > 0){
				toolMessage.hide();
				$("#psHolder").show();
			}else{
				$("#psHolder").hide();
				toolMessage.show();
			}
		}
		break;
		
		case "user": 
		{
			if(states.user === undefined || states.user === ''){
				toolMessage.html("You are not signed in.");
				singInUser();
			}
			else
				toolMessage.html("You are signed in as: "+ states.user);
		}
		break;
		
		case "alpha":
		{
			if(states.menu !== "visible"){
				updateStates({"menu": "visible"});
				var menuItems = {
					"Vocab": {
						"Alphabets": "alpha",
						"Genres": "genres",
						"Actions": "actions",
						"Synonyms": "synonym",
						"Homonymn": "homonym",
						"Antonym": "antonym",
						"Hyperbole": "hyperbole",
						"Tajweed": "tajweed",
						"Greetings": "greetings",
						"Colors": "colors",
						"Pronouns": "pronouns"
					},
					"Chart" :{
						"Alphabets": "alphabets",
						"Synonyms": "synonym",
						"Homonym": "homonym",
						"Antonyms": "antonym",
						"Jarr": "jarr",
						"Verbs": "verbs",
						"Verb Forms": "verb-forms",
						"Imperatives": "imperative"
					},
					"Misc" :{
						"Clock": "clock",
						"Calendar": "calendar",
						"Number": "number",
						"Abjad": "abjad",
						"Patterns": "patterns"
					},
					"TTS" :{
						"Text-to-Speech": "tts"
					}
				};
				
				var menu = '<div class="tool-menu">';
				for (const [key, value] of Object.entries(menuItems)){
					var type = Object.prototype.toString.call(value);
					if(type === "[object String]")
						menu +=
						`<span class="menuitem" onclick="${value}">${key}</span>`;
					else{
						var onAction = `showChart('${key}')`;
						menu += 
						`<span class="menuitem" 
							onclick="toggleMenu(['Vocab','Chart','Misc','TTS'],'sel${key}')">
							${key}:
							<select id="sel${key}" onchange="${onAction}">`;
						for(const [k,v]of Object.entries(value))
							menu += `<option value="${v}">${k}</option>`;
						menu += '</select></span>';
					}
					
					$("#sel"+key).hide();
				}
				menu = menu + '</div>';
				toolMessage.append(menu);
				
				setTimeout(function(){
					var sel = opt && opt["alpha-selection"] ?  opt["alpha-selection"] : 'selVocab';
					toggleMenu(['Vocab', 'Chart', 'Misc', 'TTS'], sel);
				},10);

			}else{
				updateStates({"menu": "hidden"});
			}
		}
		break;
		
		case "qsearch":
		{
			toolMessage.html($('<p Style="padding:0;margin:0;"><b>Quran search</b></p>'));
		}
		break;
		
		case "dict":
		{
			toolMessage.html($('<p Style="padding:0;margin:0;"><b>Grammar & Word Analysis</b></p>'));
		}
		break;

		case "resources":
		{
			toolMessage.html($('<p Style="padding:0;margin:0;"><b>Learning resources</b></p>'));
		}
		break;

		case "km":
		{
			toolMessage.html($('<p Style="padding:0;margin:0;"><b>Knowledge Check</b></p>'));
		}
		break;
		
		case "hw":
		{
			toolMessage.html($('<p Style="padding:0;margin:0;"><b>Practice Letter Writing</b></p>'));
		}
		break;
	}
}

function toggleMenu(items, key){
	items.every(function(mi){
		if("sel"+mi == key){
			$("#sel"+mi).show();
			showChart(mi);
		}else{
			$("#sel"+mi).hide();
		}
		return true;
	});
}

function updateInitialStates(){
	updateStates({"ss_support": speech_synthesis_supportd ?
						"Speech Synthesis is supported by the browser!":
						"Speech Synthesis is NOT supported by the browser!"});
	updateStates({"speech": autoplay ?
						"Autoplay is now disabled!":
						"Autoplay is now enabled!"});
}

function checkBrowserSupport(){
	
	if(navigator){
		const userAgent = navigator.userAgent;
		console.log(userAgent);
		if (userAgent.includes("Edg") || userAgent.includes("Chrome")) {
			setTimeout(function(){$("#info").hide();},5);
		}else{
			updateStates({"info": "Best viewed in Chromium/Edge browser."});
			$("#info").show();
			updateToolDescription("info");
		}
	}
				
	var support = document.getElementById("support").innerHTML;
	if(support.startsWith("Hurray")){
		speech_synthesis_supportd = true;
		//toggleAutoplay();
		updateInitialStates();
		$("#ss-support_1").hide();
		$("#ss-support_2").hide();
	}
	else{
		speech_synthesis_supportd = false;
	}	
}

function autoplayAudio(chapter, page){
	var lang = parent ? parent.getLangOption() : "en-US";
	var url = getLocationPath() + 'data/audio/'+ lang + '_' + chapter + '_autoplay.json';
	console.log('Loding play file: ' + url);
	loadJsonData(url).then((data) => {
		var sections = jQuery.map(data, function(obj) {
			if(obj.pageNo === page)
			return obj.sections;
		});
		
		// Load play list
		$('#playSections').find('option').remove().end();
		if(sections){
			sections.forEach(function(sect){
				$('#playSections').append('<option value="'+ sect.play +'">'+sect.topic+'</option>');					
			});
			
			$("#text").text($('#playSections').val());
			
			if(autoplay)
				$("#play").click();
			
			
		}
	}, function(err){
		console.log("Please change language option and retry!");
	});
}

function loadHandwriting(){
	console.log("loadHandwriting");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "draw.html"));
	}, 5);	
}

async function getiSearchSuggesstions(txt, callback){
	ensureJsonData({name:'isearchData'})
	.then((data) => {
		// Merge definitions data
		ensureJsonData({name: 'def-data'})
		.then((data2) => {			
			var txt_lc = txt ? txt.toLowerCase().trim() : '';
			handleiSearchData(txt_lc, callback);		
		});
	});
}

function handleiSearchData(txt, callback){
	
	// update global var for suggestions
	var txtInput = txt ? arRemovePunct(txt) : txt;
	var res = getDefaultActions(txt);
	
	// Process seach list
	for(const [k,v] of Object.entries(dataCache["isearchData"].data)){
		var kVal=arRemovePunct(k);
		if(kVal.toLowerCase().includes(txtInput)){
			if(kVal.includes(";")){
				res.push(' '+k.split(";")[0].trim());
			}else{
				res.push(' '+kVal);
			}
		}
	}
	
	//Process definitions
	for(const [k,v] of Object.entries(dataCache["def-data"].data)){
		var arVal = arRemovePunct(k);
		var kVal=`${v.en};${arVal}}`;
		if(kVal.toLowerCase().includes(txtInput)){
			if(kVal.includes(";")){
				res.push(`def:${arVal}`);
			}else{
				res.push(`def:${arVal}`);
			}
		}
	}
	if(callback){
		callback(res);
	}
}

window.inSearch = function(txt) {
	isearch(txt);
};

function isearch(txt){
	var data = arRemovePunct( (txt ?? $("#insearchtxt").val()).trim());
	var obj, objKey;
	
	if(data.startsWith('def:')){
		obj = {
			"path": "dict.html",
			"action": "defs",
			"data": `bm_${data.trim()}`
		}
	}
	else if(data.startsWith('...')){
		var action, value, key = data.trim();
		if (key.startsWith('...Analyze ')) {
			action = 'analyze';
			data = key.replace('...Analyze ', '');
			obj = {
				"path": "dict.html",
				"action": action,
				"data": data
			}
		}
		else if(key.startsWith('...QuranSearch ')){
			action = 'qsearch';
			data = key.replace('...QuranSearch ','');
			obj = {
				"path": "qsearch.html",
				"action": 'search',
				"data": data
			}
		}
		else if(key.startsWith('...Phrase ')){
			action = 'prep-ph';
			data = key.replace('...Phrase ','');
			obj = {
				"path": "dict.html",
				"action": action,
				"data": data
			}
		}
		
		if(!action){
			return;
		}
	}
	
	if(!obj){
		var res = Object.keys(dataCache["isearchData"].data).reduce(function (filtered, key) {
			if (arRemovePunct(key).startsWith(data)){
				objKey = key;
				return key;
			}
		}, {});
		if(objKey === undefined) return;
		var obj = dataCache["isearchData"].data[objKey];
		if(obj.data && obj.data !== '@key')
			data = obj.data;
	}
	
	if(obj.path === "dict.html"){
		loadGrammarView({
			action: obj.action,
			data: data
		});
	}else if(obj.path === "cards.html" || obj.path === "charts.html" ||
			 obj.path === "clock.html" || obj.path === "calendar.html" ||
			 obj.path === "number.html")		 
	{
		updateToolDescription('alpha', {"alpha-selection": "sel"+obj.action});
		if(obj.data){
			$("#sel"+obj.action).val(obj.data);
			$("#sel"+obj.action).trigger('onchange');
		}	
	}else if(obj.path === 'qsearch.html'){
		updateToolDescription('qsearch');
		loadQuranSearch(obj.data)
	}
}

function getDefaultActions(txt){
	var res = [];
	
	if(txt){
		var t = arRemovePunct(txt);
		if(txt.match(/[\u0621-\u064A]+/g) && !txt.includes(' ')){
			res.push('...Analyze '+t);
		}
		res.push('...QuranSearch '+t);
		res.push('...Phrase '+t+ ' ');
	}
	return res;
}

function genAndDownloadSitemap(){
	ensureJsonData({name:'isearchData'})
	.then((data) => {
		var siteMap = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
		siteMap += getDefaultSiteMapUrls();
		for(const [k,v] of Object.entries(data)){
			var keys = k.split(";").filter(x => x !== "");
			keys.every(function(xKey){
				siteMap += getSitemapUrl(xKey);
				return true;
			});
		}
		siteMap += '</urlset>';
		saveTextAsFile(siteMap, "site-map.xml");
	});
}

function saveTextAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getDefaultSiteMapUrls(){
	return getSitemapUrl() + 
		   getSitemapUrl('Quran search');
}

function getSitemapUrl(query){
	var priority = '1.0';
	var dateStr = '2025-01-08'
	var baseUrl = 'https://munawwaransari.github.io/alug';
	if(query) baseUrl += '?q='+encodeURI(query);
	return `
	<url>
    	<loc>${baseUrl}</loc>
    	<lastmod>${dateStr}</lastmod>
    	<changefreq>monthly</changefreq>
    	<priority>${priority}</priority>
   	</url>`;
}

function changeTheme(opt){
	$('body[class^="theme-"]').removeClass();
	var t=$(opt).val();
	if(t !== 'default'){
		$('body').addClass(t);
	}
}

function changeBackground(opt){
	var div = $('.toolDiv');
	var bg=$(opt).val();
	if(bg !== 'default'){
		div.css('background-image', `url("images/h-${bg}.jpg")`);
		div.css('background-repeat', 'round');
	}else{
		div.css('background-image', '');
	}
}