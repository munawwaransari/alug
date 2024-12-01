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
var posAPIObj;

window.onload = function(){
	 
	posAPIObj = new posAPI(getLocationPath(), function(msg, err){
		if(err){
			console.log("Failed to initialize pos api");
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