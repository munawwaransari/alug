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

function showPronounInfo(k, v1, v2){
	var container = $(".dictionary");
	container.empty();
	updateState(k, {ar: v1, en: v2});
	
	container.append($('<select class="pronounFilter" onchange="filterPronounView()">'+
					'<option value="all">Show All</option>'+
					'<option value="Subjective Pronouns">Subjective Pronouns</option>'+
					'<option value="Objective Pronouns">Objective Pronouns</option>'+
					+'</select>'));
					
	addPronounConjugation(container, "images/pronouns/subject/", "Subjective Pronouns", "ضمائرُ المُنفَصِلَة",{
		"3": ["he","they(m2)","they(m)","she","they(f2)","they(f)"],
		"2": ["you(m)","you(m2)","you all(m)","you(f)","you(f2)","you all(f)"],
		"1": ["i","we"]
	});
	addPronounConjugation(container, "images/pronouns/object/", "Objective Pronouns", "ضمائرُ المُتَّصِلَة",{
		"3": ["him","them(m2)","them(m)","her","them(f2)","them(f)"],
		"2": ["you(m)","you(m2)","you all(m)", "you(f)","you(f2)","you all(f)"],
		"1": ["me","us"]
	});
}

function filterPronounView(){
	var val = $(".pronounFilter").val();
	if(val == 'all'){
		$('.pTable tr').show();
	}else{
		$('.pTable tr').hide();
		$("#pTable_"+val[0]+' tr').show();
	}
}

function addPronounConjugation(container, path, en, ar, pronounMap){
	var pTable = '<table id="pTable_'+en[0]+'" class="pTable"><tr>'+
					'<th colspan="3" class="engText" style="font-size: 18px;">'+en+' ('+ar+')</th>';		
	pTable += getRows(en[0]+'3', path, pronounMap["3"], 'Third person (غائب)');	
	pTable += getRows(en[0]+'2', path, pronounMap["2"], 'Second person (حاضر)');
	pTable += getRows(en[0]+'1', path, pronounMap["1"], 'First person (مُتكلِّم)');
	pTable += '</table>';
	container.append($(pTable));
	showExampleRow(null);
}

function getRows(id, path, arr, title){
	var rows = '<tr><td colspan="3" style="background-color:#E8E885; font-size:16px;">'+title+'</td></tr>';
	for(var i=0; i < arr.length; i++){
		if(i == 0){
			rows += '<tr>';
		}
		if(i == 3){
			rows +='</tr><tr><td id="'+id+'" colspan="3" class="exp">example</td></tr>';
			rows += '<tr>';
		}
		rows += '<td><img onclick="showExampleRow(\''+id+'\',\''+arr[i]+'\')" width="100px;" src="'+path+arr[i]+'.png" /></td>';
	}
	//if(arr.length < 3){		
	//	rows +='</tr><tr><td id="'+id+'" colspan="2" class="exp">example</td></tr>';
	//}
	rows += '</tr>';
	return rows;
}

function showExampleRow(id, value){
	$(".exp").hide();
	if(id){
		$("#"+id).html(id[0] === 'S' ?  getRandomExample1(value) : getRandomExample2(value));
		$("#"+id).show();	
	}
}

function getRandomExample2(v){
	var examples = ["كِتَاب", "فُندُوق", "مِندِيل", "لِبَاس", "مِزاج"];
	
	const randomNumber = Math.ceil(Math.random() * examples.length);
	var ex = examples[randomNumber-1].split("|");
	var suffix = "";
	var val = v.split(/[()]+/);
	
	if(val[0].includes("you")){
		if(val[0] === 'you'){
			if(val[1].includes('2'))
				suffix = 'ُكُمَا'; 	
			else if(val[1] === 'm')
				suffix = 'ُكَ'; 	
			else 
				suffix = 'ُكِ'; 	
		}
		else {
			if(val[1] === 'm')
				suffix = 'كُم'; 	
			else
				suffix = 'ُكُنَّ'; 	
		}	
	} 
	else if(val[0].includes("them")){
			if(val[1].includes('2'))
				suffix = "ُهُمَا"
			else if(val[1] === 'm')
				suffix = 'ُهُم'; 	
			else
				suffix = 'ُهُنَّ'; 	
	}
	else if(val[0] === 'him')
		suffix = 'ُهُ'; 	
	else if(val[0] === 'her') 
		suffix = 'ُهَا'; 	
	return ex[0] + suffix;
}

function getRandomExample1(v){
	var examples = ["مُدَرِّس|ان|وُن|َة|تَانِ|َات", 
			  "عالِم|ان|وُن|َة|تَانِ|َات", 
			  "شاهِد|ان|وُن|َة|تَانِ|َات", 
			  "مُهَنّدِس|ان|وُن|َة|تَانِ|َات"];
	
	const randomNumber = Math.ceil(Math.random() * examples.length);
	var ex = examples[randomNumber-1].split("|");
	var prefix = "";
	
	var val = v.split(/[()]+/);
	var index=0;
	switch(val[1]){
		case "m": val[0] === "you" ? index = 0 : index = 2; break;
		case "f": val[0] === "you" ? index = 3 : index = 5; break;
		case "m2": index = 1; break;
		case "f2": index = 4; break;
		default:
			if(val[0] == 'she') index = 3;
			if(val[0] == 'he') index = 0;
			break;
	}
	
	var ret = ex[0];
	if(index > 0){
		ret += ex[index];
	}
	return getPronoun(val[0], val[1]) + ' ' + ret;
}

function getPronoun(val1, val2){
	if(val1.includes('you')){
		if (val1 === "you all"){
			if(val2=="m") 
				return 'اَنتُم';	
			else
				return 'اَنتُنَّ';	
		}else if(val2.includes('2')){
			return 'اَنتُماَ';	
		}else if(val2 == "m"){
			return 'اَنتَ';
		}else{
			return 'اَنتِ';
		}
	}
	
	if(val1.includes('they')){
		if(val2.includes('2')){
			return 'هُمَا';
		}
		else { 
			if(val2=="m")
				return 'هُم';	
			else
				return 'هُنَّ';
		}
	}
	if(val1 === 'he') return 'هُوَ';
	if(val1 === 'she') return 'هِيَ';
	return '';
}