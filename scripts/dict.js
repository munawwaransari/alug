//
//	Author: munawwar_ali@yahoo.com
//

var lastSuggestionInput = undefined;
var mappings = {};
var dict = {};
var lastIndex2 = undefined;
var lastIndex = undefined;
var formFilters = [];
var index1 = ["ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","و","ه","ي"];
var index2Suffixes = ["آ","إ","أ","ا","ؤ","و","ئ","ي","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه"];
var posAPIObj, cmpAPIObj;
var dState = {};

window.onload = function(){
	 
	posAPIObj = new posAPI(getLocationPath(), function(msg, err){
		if(err){
			console.log("Failed to initialize pos api");
			return;
		}
	});
	
	cmpAPIObj = new cmpAPI(getLocationPath(), function(msg, err){
		if(err){
			console.log("Failed to initialize cmp api");
			return;
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
	 
	// add index
	index1.every(function(key){
	  addIndex(key);
	  return true;
	});
	$(".index").append($('<div id="btnindex" class="btnl" onclick="toggleIndex(\'index\')">Collapse</div>'));
	toggleIndex('index');
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
	var res = posAPIObj.analyzeWord(word, true);	
	posAPIObj.addHtml($(".dictionary"), res, true);
}

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

function lookupEx(site){
	var w = parent ? parent.window : window;
	var lang = parent.getLang ? parent.getLang(): 'en';
	if(site.includes('$'))
		site = site.replace('$', lang);
	var url = site+$("#wordSearchText").val();
	w.open(url, "_blank");	
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

function showComparisions(){
	cmpAPIObj.addComparisionList($(".dictionary"));
}

function loadComparision(){
	cmpAPIObj.addComparisionTable(".dictionary", $(".dictionary select").val());
}

function showTriliteralVerbTable(){
	
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
					'<tr style="background-color:#E8E885"><td>(فَتَحَ)</td><td>(يَفْتَحُ)</td>'+
					'<td>(فُتِحَ)</td><td>(يُفْتَحُ)</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعَلَ</td><td>يَفْعِلُ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#E8E885"><td>(ضَرَبَ)</td><td>(يَضْرِبُ)</td>'+
					'<td>(ضُرِبَ)</td><td>(يُضرَبُ)</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعَلَ</td><td>يَفْعُلُ</td><td>يَفْعُلَ</td>'+
					'<td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#E8E885"><td>(نَصَرَ)</td><td>(يَنْصُرُ)</td>'+
					'<td>(نُصِرَ)</td><td>(يُنْصَرُ)</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعِلَ</td><td>يَفْعَلُ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#CFE2F3"><td>(سَمِعَ)</td><td>(يَسْمَعُ)</td>'+
					'<td>(سُمِعَ)</td><td>(يُسْمَعُ)</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعِلَ</td><td>يَفْعِلُ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#CFE2F3"><td>(حَسِبَ)</td><td>(يَحسِبُ)</td>'+
					'<td>(حُسِبَ)</td><td>(يُحْسَبُ)</td>'+
				'</tr>'+
				'<tr>'+
					'<td>فَعُلَ</td><td>يَفْعُلَ</td>'+
					'<td>فُعِلَ</td><td>يُفْعَلَ</td></tr>'+
					'<tr style="background-color:#DFB4C9"><td>(كَرُمَ)</td><td>(يَكْرُمُ)</td>'+
					'<td>(كُرِمَ)</td><td>(يُكْرَمُ)</td>'+
				'</tr>'+
				'<table>';
	$(".dictionary").append('<div style="height:10px;"></div>');
	$(".dictionary").append($(table));
}

function showInadequateVerbTable(){
	
	$(".dictionary").empty();
	var table = '<table class="pTable">'+
				'<tr style="background-color:#E8E885;"><td><b>توقيت (Timing)</b></td></tr>'+
				'<tr style="background-color:#E8E885;"><td>to become / to change<br/>أصبَحَ / أَمسَ / ظَلّ / بَاتَ</td></tr>'+
					'<tr><td>اصبَحَ الطَّقَسُ جَمِيلَةً<br/>The weather has become beautiful<br/>بَاتَ المَريضُ جَادًا<br/>The patient became (in night) seriosly ill</td></tr>'+
				'</tr>'+
				'<tr style="background-color:#E8E885;"><td><b>تحويل (Transition)</b></td></tr>'+
				'<tr style="background-color:#E8E885;"><td>to tansition / become<br/>صَارَ / صَارَ إِلَي</td></tr>'+
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
	
	$(".dictionary").empty();
	var table = '<table class="pTable">'+
				'<tr><td style="background-color:#E8E885;"><b>مِثال</b></td>'+
					'<td rowspan="3">(يَفعَلُ) يَوجِدُ => يَجِدُ<br/><br/>(يَفعِلُونَ) يَوذِرُونَ => يَذِرُونَ</td></tr>'+
				'<tr style="background-color:#E8E885;"><td>ف كلمة => ا و ي</td></tr>'+
					'<tr><td>(و ج د)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَمَن يَلْعَنِ اللَّهُ فَلَن تَجِدَ لَهُ نَصِيرًا [4:52]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>أَجوَف</b></td>'+
					'<td rowspan="3">(فَعَلَ) قَوَلَ => قَالَ<br/><br/>(فُعِلَ) قُوِلَ => قِيلَ</td></tr>'+
				'<tr><td style="background-color:#E8E885;">ع كلمة => ا و ي</td></tr>'+
					'<tr><td>(ق و ل)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَأَن تَصُومُوا خَيْرٌ لَّكُمْ [2:184]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>نَاقِص</b></td>'+
					'<td rowspan="3">(فَعَلُوا) رَضَيُوا=> رَضُوا<br/></td></tr>'+
				'<tr><td style="background-color:#E8E885;">ل كلمة => ا و ي</td></tr>'+
					'<tr><td>(ر ض ي)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ [5:119]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>لَفِيف</b></td>'+
					'<td rowspan="3">(اِفتَعَلَ) إوتَقَيَ => إتْتَقَي => إتَّقَي<br/><br/>(فَعِلنَا) وَقِينَا=> وَقِنَا</td></tr>'+
				'<tr><td style="background-color:#E8E885;">و/ي root has</td></tr>'+
					'<tr><td>(و ق ي)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَقِنَا عَذَابَ النَّارِ [3:16]', false)+'</td></tr>'
				+
				'<tr><td style="background-color:#E8E885;"><b>مَهمُوز</b></td>'+
					'<td rowspan="3">(فَعَلُوا) رَأَيُو => رَأَو<br/><br/>(يَفعَلُ) يَاكُلُ [Exception]</td></tr>'+
				'<tr><td style="background-color:#E8E885;">root has hamza</td></tr>'+
					'<tr><td>(أ ك ل)</td></tr>'+
				'</tr>'+
				'<tr><td colspan="2">'+replaceQLink('وَلَئِنْ أَرْسَلْنَا رِيحًا فَرَأَوْهُ مُصْفَرًّا [30:51]', false)+'</td></tr>'+
				'<table>';
	$(".dictionary").append('<div style="height:10px;"></div><div style="width:100%; text-align:center">حرف العِلَّت When root of a word has one or more </div>');
	$(".dictionary").append($(table));
}