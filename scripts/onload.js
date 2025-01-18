//
//	Author: munawwar_ali@yahoo.com
//

$(document).ready(function()
{
	if(isOS("Android")){
		setTimeout(function(){
			if(speechSynthesis.onvoiceschanged)
				speechSynthesis.onvoiceschanged();
		}, 10);
	}
	
	$(".tool").on('click', function(){
		updateToolDescription(event.target.id);
	});
	
	window.onresize = updateDeviceSize;
	updateDeviceSize();
	function updateDeviceSize(){
		var deviceType = getDeviceType();
		$(".toolDiv").removeClass('mobile');
		$(".toolDiv").removeClass('pad');
		$(".toolDiv").removeClass('desktop');
		$(".toolDiv").addClass(deviceType);
		console.log(deviceType);
		window.onresize = undefined;
	}
	
	nodeInserted("#languages");
	$(document).on("nodeInserted",function(e,q){
		if (q === "#languages"){
			$("#languages").parent().hide();
			
			/*
			var c = "";
			var o = $("#languages option");
			if(o && o.length > 0){
				o.each(function(i, opt){
					c = c + opt.value + ", ";
				});
			}
			alert(c);
			*/
			
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
		var searchVal = decodeURI(getParamValue("search"));	
		if(searchVal && searchVal != 'undefined'){
			loadQuranSearch(searchVal);
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

function loadLanguages(){
	var l = $("#languages");
	l.empty();
	/*
	if(l.length == 0)
		$("#main").append('<select id="languages"/>');
	var voices = speechSynthesis.getVoices().filter(function(v){
		var lang = v.lang.replace('_','-');
		var flag = lang === 'ur-IN' || lang ==='ur-PK' || lang === 'ur-IN' ||
				   lang === 'ar-SA' || 
				   lang === 'en-US';
		if(flag){
			$("#main #languages").append($('<option value="'+ lang + '" select>'+v.name+'</option>'))
		}
		return flag;
	});
	$(document).trigger("nodeInserted",['#languages']);
	*/
	const event = new Event('onvoiceloaded');
	document.dispatchEvent(event);
};

			
function singInUser(){
	console.log("signIn");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "login.html"));
		//$('#title-img').hide();
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
		toggleIcon("#ss-support");
		alert('Speech synthesis is not supported on your browser!');
	}else{
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
	/*
	if(menuOption){
		
	}else{
		$("#menu-container").css('display', 'none!important');
		$("#menu-container").css('overflow', 'hidden!important');
		$("#menu-container").hide();
	}*/
	console.log('menuOption :' + menuOption);
}

function toggleIcon(id){
	[id+'_1', id+'_2'].forEach(function(id){
		//console.log('toggleIcon: ' + id); 
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
		//$('#title-img').hide();
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
		//$('#title-img').hide();
	}, 5);
}

function loadQuranSearch(text){
	
	console.log("loadQuranSearch");
	$('.reading-pane').attr("src","");
	setTimeout(function(){

		//get lang pram value
		var selectElement = document.getElementById('lang-options');
		var lang = selectElement.value.substring(0,2);

		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "qsearch.html?search="+text+"&lang="+lang));
		//$('#title-img').hide();
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
		default: console.log('Error: invalid section');	return;
	}
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() +  path));
	}, 5);
}

//ref: https://stackoverflow.com/questions/7434685/how-can-i-be-notified-when-an-element-is-added-to-the-page
function nodeInserted(elementQuerySelector){
    if ($(elementQuerySelector).length===0){
        setTimeout(function(){
            nodeInserted(elementQuerySelector);
        },100);
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
	
	switch(id){
		case 'in-search':
			var sdiv = $('<div>'+
			'<input id="insearchtxt" class="isearch"/>'+
			'<input type="reset" value="" alt="clear" title="Clear" onclick="$(\'#insearchtxt\').val(\'\');"/>'+
			'<button id="isearchD" class="dropbtn" '+
				'style="background-color:#6AA84F;top:-8px; height: 30px;margin-left:-18px;" '+
				'onclick="isearch()"><b>Go!</b></button>'+
			'</div>');
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
						"Synonyms": "synonym",
						"Homonymn": "homonym",
						"Antonym": "antonym",
						"Hyperbole": "hyperbole",
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
						"Patterns": "patterns"
					}
				};
				
				var menu = '<div class="tool-menu">';
				for (const [key, value] of Object.entries(menuItems)){
					var type = Object.prototype.toString.call(value);
					if(type === "[object String]")
						menu = menu + '<span class="menuitem" onclick="'+value+';">'+key+'</span>';
					else{
						var onAction = 'showChart(\''+key+'\')';
						menu += '<span class="menuitem" onclick="toggleMenu([\'Vocab\',\'Chart\',\'Misc\'],\'sel'+key+'\')">'+
							key+':<select id="sel'+key+'" ' +
									' onchange="'+onAction+'">';
						for(const [k,v]of Object.entries(value))
							menu += '<option value="'+v+'">'+k+'</option>';
						menu += '</select></span>';
					}
					
					$("#sel"+key).hide();
				}
				menu = menu + '</div>';
				toolMessage.append(menu);
				
				setTimeout(function(){
					var sel = opt && opt["alpha-selection"] ?  opt["alpha-selection"] : 'selVocab';
					toggleMenu(['Vocab', 'Chart', 'Misc'], sel);
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
		toggleAutoplay();
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
	loadJsonData(url, function(data){
		
		var sections = jQuery.map(data, function(obj) {
			if(obj.pageNo === page)
			return obj.sections;
		});
		
		// Load play list
		$('#playSections').find('option').remove().end();
		if(sections){
			sections.forEach(function(sect){
				//console.log(sect.play);
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

// ---- i search 
var lastiSearchSuggestionInput;
var isearchData;
async function getiSearchSuggesstions(txt, callback){

	var fileUrl = getLocationPath() + 'data/isearch.json';
	console.log('getting suggestions: '+fileUrl);
	var txt_lc = txt ? txt.toLowerCase().trim() : '';
	
	if(isearchData === undefined)
		loadJsonData(fileUrl, function(data){
			isearchData = data;
			handleiSearchData(txt_lc, callback);
		});
	else
		handleiSearchData(txt_lc, callback);
}

function handleiSearchData(txt, callback){
	
	// update global var for suggestions
	var txtInput = txt ? arRemovePunct(txt) : txt;
	var res = getDefaultActions(txt);
	for(const [k,v] of Object.entries(isearchData)){
		var kVal=arRemovePunct(k);
		if(kVal.toLowerCase().includes(txtInput)){
			if(kVal.includes(";")){
				res.push(' '+k.split(";")[0].trim());
			}else{
				res.push(' '+kVal);
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
	
	if(data.startsWith('...')){
		var action, value, key = data.trim();
		if(key.startsWith('...Analyze ')){
			action = 'analyze';
			data = key.replace('...Analyze ','');
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
		
		if(!action){
			return;
		}
	}
	
	if(!obj){
		var res = Object.keys(isearchData).reduce(function (filtered, key) {
			if (arRemovePunct(key).startsWith(data)){
				objKey = key;
				return key;
			}
		}, {});
		if(objKey === undefined) return;
		var obj = isearchData[objKey];
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
		if(txt.match(/[\u0621-\u064A]+/g) && !txt.includes(' ')){
			res.push('...Analyze '+arRemovePunct(txt));
		}
		res.push('...QuranSearch '+arRemovePunct(txt));
	}
	return res;
}

function genAndDownloadSitemap(){
	var dataFile =  getLocationPath() + 'data/isearch.json'; 
	loadJsonData(dataFile, function(data){
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
	return '<url>'+
      '<loc>'+baseUrl+'</loc>'+
      '<lastmod>'+dateStr+'</lastmod>'+
      '<changefreq>monthly</changefreq>'+
      '<priority>'+priority+'</priority>'+
   '</url>';
}