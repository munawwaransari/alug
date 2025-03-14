//
//	Author: munawwar_ali@yahoo.com
//

var lastSuggestionInput = undefined;
var mappings = {};
var dict = {};
//var lastIndex2 = undefined;
//var lastIndex = undefined;
//var formFilters = [];
//var index1 = ["ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","و","ه","ي"];
//var index2Suffixes = ["آ","إ","أ","ا","ؤ","و","ئ","ي","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه"];
var posAPIObj, cmpAPIObj, posSearchObj;
var dState = {};
var params = { "action": undefined, data: undefined};

window.onload = function(){
	 
	params["action"] = decodeURI(getParamValue('action'));
	params["data"] = arRemovePunct(decodeURI(getParamValue('data')));
	
	/*
	setTimeout(function(){
		posSearchObj = new posSearch(getLocationPath(), function(msg, err){
			if(err){
				console.log("Failed to initialize pos search api");
				return;
			}
		});		
	}, 10);
	*/
	
	posAPIObj = new posAPI(getLocationPath(), function(msg, err){
		if(err){
			console.log("Failed to initialize pos api");
			return;
		}
		
		posSearchObj = new posSearch(getLocationPath(), function(msg, err){
			if(err){
				console.log("Failed to initialize pos search api");
				return;
			}
			
			if(params.action && params.action !== 'cmp'){
				handleParams();
			}
		});			
	});
	
	cmpAPIObj = new cmpAPI(getLocationPath(), function(msg, err){
		if(err){
			console.log("Failed to initialize cmp api");
			return;
		}
		if(params.action === 'cmp'){
			handleParams();
		}
	});
	
	autocomplete(document.getElementById('wordSearchText'), function(val, callback){
		var condition = val.length > 1 && val !== lastSuggestionInput;
		if(val.length > 1 && val !== lastSuggestionInput){
			lastSuggestionInput = val;
			getSuggesstions(val, callback);
		}
		return condition;
	});
	
	var mappingUrl = getLocationPath() + 'data/ar.dic/mapping.json'
	loadJsonData(mappingUrl, function(data){
			mappings = data;
	});
	 
	$("#wordSearchText").keyup(function(event) {
		if (event.keyCode === 13) {
			$("#SearchD").click();
		}
	});
}

function selectAndTrigger(data, filterClass){
	var d = data ? data.toLowerCase() : data;
	const select = document.getElementsByClassName(filterClass)[0];
	for (let i = 0; i < select.options.length; i++) {
		if (arRemovePunct(select.options[i].value).toLowerCase().includes(d)) {
		  $("."+filterClass).val(select.options[i].value);
		  $("."+filterClass).trigger('onchange');
		}
	}
}

function selectIndexAndTrigger(index, filterClass){
	const select = document.getElementsByClassName(filterClass)[0];
	$("."+filterClass).val(select.options[index].value);
	$("."+filterClass).trigger('onchange');
}

function loadWord(txt){
	$("#wordSearchText").val(txt);
	analyzeSelectedWord();
}

function handleParams(){
	
	var action = params["action"]; //getParamValue('action');
	switch(action){
		case 'analyze':
		var word = params["data"]; //getParamValue('data');
		if(word && word.trim()){
			loadWord(word);
			//$("#wordSearchText").val(word);
			//analyzeSelectedWord();
		}
		break;
		
		case 'vtab-all': showVerbTable(); break;
		case 'vtab-3': showTriliteralVerbTable(); break;
		case 'vtab-inad': showInadequateVerbTable(); break;
		case 'vtab-weak': showWeakVerbTable(); break;
		case 'vtab-imp': showImperativeTable();break;
		
		case 'noun-pat': 
			showNounTable(); 
			if(params["data"]){
				selectAndTrigger(params["data"], 'nFilter');
			}
			break;

		case 'five-noun':
			showFiveNouns('ism', 'اسماءُ الخَمسة', 'Five Nouns');
			break;
			
		case 'pronoun': 
			showPronounInfo('ism', 'ضَمائر', 'Pronouns');
			var sel = decodeURI(params["data"]);
			if(sel){
				$(".pronounFilter").val(sel);
				filterPronounView();
			}
			break;
		case 'noun-plural':
			loadArabicLTTable('plural.csv', 'ism','الجمع', 'Plural');
			break;
		case 'noun-syn':
			loadArabicLTTable('synonyms.csv', 'ism','المرادفات', 'Synonyms');
			break;
		case 'noun-ant':
			loadArabicLTTable('antonyms.csv', 'ism','المتضادات', 'Antonyms');
			break;
			
		case 'prep':
			setTimeout(function(){
				showParticleTable();
				if(params["data"])
					selectAndTrigger(params["data"], 'nFilter');
			});
			break;
			
		case 'obj-effect':
			setTimeout(function(){
				showObjectEffects('ism','المفاعيل', 'Object');
				if(params["data"])
					if(params["data"].startsWith("pos:")){
						var index = parseInt(params["data"].substring(4));
						setTimeout(function(){
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(params["data"], 'pronounFilter');
			});
			break;
			
		case 'adv':
			setTimeout(function(){
				showObjectEffects('ism','ظُرُوف', 'Adverbs', 'data/grmr/adverb.json');
				if(params["data"])
					if(params["data"].startsWith("pos:")){
						var index = parseInt(params["data"].substring(4));
						setTimeout(function(){
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(params["data"], 'pronounFilter');
			});
			break;
			
		case 'cmp':
			var data = params["data"];
			if(data.startsWith("pos:")){
				var index = parseInt(data.substring(4));
				showComparisions(index);
				selectIndexAndTrigger(index, 'nFilter');
			}
			else showComparisions(0);
			break;
	}
}

function showVerbTable(){
	var vTable = posAPIObj.getVerbInfo();
	posAPIObj.addVerbInfoHtml($(".dictionary"), vTable);
}

function showParticleTable(){
	var pTable = posAPIObj.getParticleInfo();
	posAPIObj.addParticleInfoHtml($(".dictionary"), pTable);
}

function checkWord(w){
	$("#wordSearchText").val(w);
	//analyzeSelectedWord();
}

function analyzeSelectedWord(){
		
	var word = $("#wordSearchText").val();
	
	//var res = posAPIObj.analyzeWord(word, true);	
	//posAPIObj.addHtml($(".dictionary"), res, true);
	
	posSearchObj.searchAndAddHtml(word, $(".dictionary"));
}

function analyzeSelectedWordOld(){
		
	var word = $("#wordSearchText").val();
	
	var res = posAPIObj.analyzeWord(word, true);	
	posAPIObj.addHtml($(".dictionary"), res, true);
}

/*
function addIndex(letter){
	var idiv = '<div class="letter" onclick="addIndex2(\''+letter+'\')">'+letter+'</div>';
	$(".index").append($(idiv));
}

function addIndex2(letter){
	$(".index2").empty();
	var index2Letters = index2Suffixes.every(function(sfx){
		var l = letter[0]+sfx;
		$(".index2").append($('<div class="letter" '+ 
							  'onclick="selectWord(\''+l+'\');">'+l+'</div>'));
		return true;
	});
	$(".index2").append($('<div class="btnl" onclick="backToIndex()">Back</div>'));
	$(".index2").append($('<div id="btnindex2" class="btnl" onclick="toggleIndex(\'index2\')">Collapse</div>'));
	$(".index").hide();
}

function backToIndex(){
	$(".index2").empty();
	$(".index").show();
}

function toggleIndex(index){
	$("."+index+">.letter").toggle();
	var btn = document.getElementById("btn"+index);
	if(btn.innerHTML === "Collapse")
		btn.innerHTML = "Expand Index";
	else
		btn.innerHTML = "Collapse";
}

function toggleForm(f){
	var checked = formFilters.filter(item => item === f);
	if(checked.length == 0){ //unchecked
		formFilters.push(f);
		$("#"+f).addClass("formFilter");
	}else{ // filter it
		formFilters = formFilters.filter(item => item !== f);
		$("#"+f).removeClass("formFilter");
	}
	//console.log(formFilters);
	loadDictionary(lastIndex);
}
*/

function selectWord(text){
	$("#wordSearchText").val(text);				
	var inp = document.getElementById('wordSearchText');
	fireInputEvent(inp);
}

function searchWord(){
	var txt = $("#wordSearchText").val();
	getSuggesstions(txt);
}

async function getSuggesstions(txt, callback){

	var file = Object.entries(mappings).filter(function([key, value]){
		return txt.startsWith(key);
	});
	if(file.length > 0){
		var fileUrl = getLocationPath() + 'data/ar.dic/'+file[0][1]+'.json';
		console.log('getting suggestions: '+file[0][1]+'.json');
		loadJsonData(fileUrl, function(data){
			// update global var for suggestions
			var suggestionsList = data.filter(function(w){
				return w.startsWith(txt);
			});
			if(callback){
				callback(suggestionsList);
			}
		});
	}
}

function openMeaning(){
	var txt = $("#wordSearchText").val();
	if(txt !== null && txt !== ''){
		lookUp(txt);
	}
}

function searchInQuran(){
	var txt = $("#wordSearchText").val();
	if(txt !== null && txt !== ''){
		loadSearch(txt, true);
	}
}

function OpenInChatGPT(){
	var txt = $("#wordSearchText").val();
	var lang = parent.getLang();
	
	var url = "https://chatgpt.com?q=";
	var prompt = "";
	switch(lang){
		case 'en':
			prompt = decodeURI('Generate three sample sentences using word '+txt+' from the Quran or Hadith and translate into English language');
		break;
		
		case 'ur':
			prompt = decodeURI('Generate three sample sentences using word '+txt+' from the Quran or Hadith and translate into Urdu language');
		break;
		
		case 'ar':
			prompt = decodeURI('Generate three sample sentences using word '+txt+' from the Quran or Hadith and translate into English and Urdu languages');
		break;
	}
	parent ? parent.window.open(url+prompt, '_blank') : window.open(url+prompt, '_blank');
}

function updateState(key, value){
	dState[key] = value;
	for(const [k,v] of Object.entries(dState))
	{
		$("#"+key+" button").text(v.ar);
		$("#"+key+" button").prop('title', v.en);
	}
}

function showNounTable(k, v1, v2){
	updateState(k, {ar: v1, en: v2});
	var nTable = posAPIObj.getNounInfo();
	posAPIObj.addNounInfoHtml($(".dictionary"), nTable);
}

function showComparisions(inp){
	cmpAPIObj.addComparisionList($(".dictionary"), inp);
}

function loadComparision(){
	cmpAPIObj.addComparisionTable(".dictionary", $(".dictionary select").val());
}

function showTriliteralVerbTable(){
	
	var alink = '<a href="#" style=" text-decoration: none" onclick="checkWord(\'$\');">$</a>';
	$(".dictionary").empty()
	var table = '<table class="pTable">'+
				'<tr style="background-color:#B6D7A8;font-size:16px;">'+
					'<th>الماضي المعلُوم</th>'+
					'<th>المُضارع المعلوم<br/>(مُرفُوع)</th>'+
					'<th>الماضي المجهُول</th>'+
					'<th>المُضارع المجهُول<br/>(مُرفُوع)</th>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعَلَ</td><td>يَفْعَلُ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#E8E885"><td>('+alink.replaceAll('$', 'فَتَحَ')+')</td><td>('+alink.replaceAll('$', 'يَفْتَحُ')+')</td>'+
					'<td>('+alink.replaceAll('$', 'فُتِحَ')+')</td><td>('+alink.replaceAll('$', 'يُفْتَحُ')+')</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعَلَ</td><td>يَفْعِلُ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#E8E885"><td>('+alink.replaceAll('$', 'ضَرَبَ')+')</td><td>('+alink.replaceAll('$', 'يَضْرِبُ')+')</td>'+
					'<td>(ضُرِبَ)</td><td>(يُضرَبُ)</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعَلَ</td><td>يَفْعُلُ</td><td>يَفْعُلَ</td>'+
					'<td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#E8E885"><td>('+alink.replaceAll('$', 'نَصَرَ')+')</td><td>('+alink.replaceAll('$', 'يَنْصُرُ')+')</td>'+
					'<td>('+alink.replaceAll('$', 'نُصِرَ')+')</td><td>('+alink.replaceAll('$', 'يُنْصَرُ')+')</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعِلَ</td><td>يَفْعَلُ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#CFE2F3"><td>('+alink.replaceAll('$', 'سَمِعَ')+')</td><td>('+alink.replaceAll('$', 'يَسْمَعُ')+')</td>'+
					'<td>('+alink.replaceAll('$', 'سُمِعَ')+')</td><td>('+alink.replaceAll('$', 'يُسْمَعُ')+')</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعِلَ</td><td>يَفْعِلُ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#CFE2F3"><td>('+alink.replaceAll('$', 'حَسِبَ')+')</td><td>('+alink.replaceAll('$', 'يَحسِبُ')+')</td>'+
					'<td>('+alink.replaceAll('$', 'حُسِبَ')+')</td><td>('+alink.replaceAll('$', 'يُحْسَبُ')+')</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعُلَ</td><td>يَفْعُلَ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#DFB4C9"><td>('+alink.replaceAll('$', 'كَرُمَ')+')</td><td>('+alink.replaceAll('$', 'يَكْرُمُ')+')</td>'+
					'<td>('+alink.replaceAll('$', 'كُرِمَ')+')</td><td>('+alink.replaceAll('$', 'يُكْرَمُ')+')</td>'+
				'</tr>'+
				'<table>';
	$(".dictionary").append('<div style="height:10px;"></div>');
	$(".dictionary").append($(table));
}

function showInadequateVerbTable(){
	
	var alink = '<a href="#" style=" text-decoration: none" onclick="checkWord(\'$\');">$</a>';
	$(".dictionary").empty();
	var table = '<table class="pTable">'+
				'<tr style="background-color:#E8E885;"><td><b>توقيت (Timing)</b></td></tr>'+
				'<tr style="background-color:#E8E885;"><td>to become / to change<br/>'+
							alink.replaceAll('$', 'أصبَح')+' / '+
							alink.replaceAll('$', 'أَمسَ')+' / '+
							alink.replaceAll('$', 'ظَلّ')+' / '+
							alink.replaceAll('$', 'بَاتَ')+'</td></tr>'+
					'<tr><td>اصبَحَ الطَّقَسُ جَمِيلَةً<br/>The weather has become beautiful<br/>بَاتَ المَريضُ جَادًا<br/>The patient became (in night) seriosly ill</td></tr>'+
				'</tr>'+
				'<tr style="background-color:#E8E885;"><td><b>تحويل (Transition)</b></td></tr>'+
				'<tr style="background-color:#E8E885;"><td>to tansition / become<br/>'+
						alink.replaceAll('$', 'صَارَ')+' / صَارَ إِلَي</td></tr>'+
					'<tr><td>صَارَ الماءُ جَليِدًا<br/>The water became ice<br/>صارَ إلَي لِصٍّ<br/>He beame a thief</td></tr>'+
				'</tr>'+
				'<tr style="background-color:#E8E885;"><td><b>نفي (Negation)</b></td></tr>'+
				'<tr style="background-color:#E8E885;"><td>لَيسَ</td></tr>'+
					'<tr><td>أَلَيْسَ الصُّبْحُ بِقَرِيبٍ [11:81]<br/>Is not the morning approaching?<br/>لَيسَ المُعَلِّمُ حاضِرًا<br/>The teacher is not present</td></tr>'+
				'</tr>'+
				'<tr style="background-color:#E8E885;"><td><b>استمرار (Continuation)</b></td></tr>'+
				'<tr style="background-color:#E8E885;"><td>to remain / continue<br/>مَازالَ / مابَرِحَ / ماأنفَكَّ</td></tr>'+
					'<tr><td>مابرح الجوء لَطيفًا<br/>Weather is still nice<br/>مازال الطِّفلُ نَائمًا<br/>The baby is still asleep</td></tr>'+
				'</tr>'+
				'<table>';
	$(".dictionary").append('<div style="height:10px;"></div>');
	$(".dictionary").append($(table));
}

function showWeakVerbTable(){
	
	var alink = '<a href="#" style=" text-decoration: none" onclick="checkWord(\'$\');">$</a>';
	$(".dictionary").empty();
	var table = '<table class="pTable">'+
				'<tr><td style="background-color:#E8E885;"><b>مِثال</b></td>'+
					'<td rowspan="3">(يَفعَلُ) يَوجِدُ => '+alink.replaceAll('$', 'يَجِدُ')+'<br/><br/>(يَفعِلُونَ) يَوذِرُونَ => يَذِرُونَ</td></tr>'+
				'<tr style="background-color:#E8E885;"><td>ف كلمة => ا و ي</td></tr>'+
					'<tr><td>(و ج د)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَمَن يَلْعَنِ اللَّهُ فَلَن تَجِدَ لَهُ نَصِيرًا [4:52]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>أَجوَف</b></td>'+
					'<td rowspan="3">(فَعَلَ) قَوَلَ => '+alink.replaceAll('$', 'قَالَ')+'<br/><br/>(فُعِلَ) قُوِلَ => قِيلَ</td></tr>'+
				'<tr><td style="background-color:#E8E885;">ع كلمة => ا و ي</td></tr>'+
					'<tr><td>(ق و ل)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَأَن تَصُومُوا خَيْرٌ لَّكُمْ [2:184]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>نَاقِص</b></td>'+
					'<td rowspan="3">(فَعَلُوا) رَضَيُوا=> '+alink.replaceAll('$', 'رَضُوا')+'<br/></td></tr>'+
				'<tr><td style="background-color:#E8E885;">ل كلمة => ا و ي</td></tr>'+
					'<tr><td>(ر ض ي)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ [5:119]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>لَفِيف</b></td>'+
					'<td rowspan="3">(اِفتَعَلَ) إوتَقَيَ => إتْتَقَي => '+alink.replaceAll('$', 'إتَّقَي')+'<br/><br/>(فَعِلنَا) وَقِينَا=> وَقِنَا</td></tr>'+
				'<tr><td style="background-color:#E8E885;">و/ي root has</td></tr>'+
					'<tr><td>(و ق ي)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَقِنَا عَذَابَ النَّارِ [3:16]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>مَهمُوز</b></td>'+
					'<td rowspan="3">(فَعَلُوا) رَأَيُو => '+alink.replaceAll('$', 'رَأَو')+'<br/><br/>(يَفعَلُ) يَاكُلُ [Exception]</td></tr>'+
				'<tr><td style="background-color:#E8E885;">root has hamza</td></tr>'+
					'<tr><td>(أ ك ل)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَلَئِنْ أَرْسَلْنَا رِيحًا فَرَأَوْهُ مُصْفَرًّا [30:51]', false)+'</td></tr>'+
				'<table>';
	$(".dictionary").append('<div style="height:10px;"></div><div style="width:100%; text-align:center">حرف العِلَّت When root of a word has one or more </div>');
	$(".dictionary").append($(table));
}

function showImperativeTable(){
	var examples = {
		"I": "فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ [93:9]",
		"II": "وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ [5:92]",
		"III": "وَلَا تُقَاتِلُوهُمْ عِندَ الْمَسْجِدِ الْحَرَامِ [2:191]",
		"IV": "وَلَا تُطِعْ كُلَّ حَلَّافٍ مَّهِينٍ [68:10]",
		"V": "فَتُذَكِّرَ إِحْدَاهُمَا الْأُخْرَىٰ [2:282]",
		"VI": "",
		"VII": "",
		"VIII": "وَلَا تَتَّبِعُوا خُطُوَاتِ الشَّيْطَانِ [2:168]",
		"IX": "",
		"X": "وَلَا تَمْنُن تَسْتَكْثِرُ [74:6]"
	};
	var container = $(".dictionary");
	var verbInfo = posAPIObj.getVerbInfo();
	var api = this;
	container.empty();
	var alink = '<a href="#" style=" text-decoration: none" '+
					' onclick="checkWord(\'$\');">$</a>';
	var vTable = $('<table id="vTable" class="vTable"><tr>'+
					 '<th class="engText" style="font-size: 14px;">Form</th>'+
					 '<th class="engText">Gender<br/>M/F</th>'+
					 '<th class="engText">2nd Person<br/>مضارع</th>'+
					 '<th colspan="2" class="engText">Imperative<br/>الأمر/النهي</th>'+
				   '</table>');
	container.append(vTable);
	
	for (const keyVal of Object.entries(verbInfo)){
		var entryName = keyVal[0];
		var xform = keyVal[1];
		if(xform){
			var pa = xform.filter(x=>x.en==="present (active)")
								   .map(x=>x.form)								   
			
			var impM1 = makeImperative(pa[0], 'm');
			var impM2 = impM1.replace(new RegExp("^(ا|([ء-ي]))","g"), "لا ت$2");
			
			var impF1 = makeImperative(pa[0], 'f');
			var impF2 = impF1.replace(new RegExp("^(ا|([ء-ي]))","g"), "لا ت$2");
			var formNumber = entryName.split(' ')[1]; 
			var row = '<tr>'+
					  '<td rowspan="2" class="engText">'+formNumber+'</td>'+
					  '<td class="engText">M</td>'+
					  '<td class="engText" style="color:#DD6188">('+make2ndPerson(pa[0], 'm')+')</td>'+
					  '<td style="color:#7575BB">'+impM1+'</td>'+
					  '<td style="color:#7575BB">'+impM2+'</td>'+
					  '</tr>'+
					  '<td class="engText">F</td>'+
					  '<td class="engText" style="color:#DD6188">('+make2ndPerson(pa[0], 'f')+')</td>'+
					  '<td style="color:#7575BB">'+impF1+'</td>'+
					  '<td style="color:#7575BB">'+impF2+'</td>'+
					  '</tr/>'+
					  '<tr>'+
					  '<td style="background-color:#F6F6BA;font-size:18px;" colspan="5">'+replaceQLink(examples[formNumber], false)+'</td>'+
					  '</tr>';			
			$("#vTable tbody").append($(row));
		}
	}
}