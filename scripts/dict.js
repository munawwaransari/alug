//
//	Author: munawwar_ali@yahoo.com
//

var lastSuggestionInput = undefined;
var mappings = {};
var dict = {};
var lastIndex = undefined;
var formFilters = [];

window.onload = function(){
	 
	autocomplete(document.getElementById('wordSearchText'), function(val, callback){
		var condition = val.length > 1 && val !== lastSuggestionInput;
		if(val.length > 1 && val !== lastSuggestionInput){
			lastSuggestionInput = val;
			getSuggesstions(val, callback);
		}
		return condition;
	});
	
	var mappingUrl = getLocationPath() + 'arabic.dic/mapping.json'
	loadJsonData(mappingUrl, function(data){
			mappings = data;
	});
	 
	var url = getLocationPath() + 'data/dict.json';
	loadJsonData(url, function(data){
			dict = data;
			for (const [key, value] of Object.entries(dict)){
			  console.log(key);
			  console.log(value);
			  addIndex(key);
			}
	});
}

function addIndex(letter){
	var idiv = '<div class="letter" onclick="loadDictionary(\''+letter+'\')">'+letter+'</div>';
	$(".index").append($(idiv));
}

function loadDictionary(letter){
	var words = dict[letter];
	if(words){
		// set index class
		if(lastIndex)
			$(".index div:contains('"+lastIndex+"')").removeClass("selectedIndex");
		$(".index div:contains('"+letter+"')").addClass("selectedIndex");
		
		if(lastIndex !== letter){
			formFilters = [];
		}
		lastIndex = letter;
		var forms = [];
		$(".dictionary").empty();
		words.forEach(function(w){
			//add forms to lookup
			if(forms.indexOf(w.form) === -1){
				forms.push(w.form);
			}
			
			if(formFilters.indexOf(w.form) === -1){
				addWord(w);
			}
		});
		
		$(".formClass").empty();
		forms.forEach(function(f){
			addFormFilter(f);
		});
		// add reset button
		var reset = '<button style="padding:10px;" onclick="resetFilters()" >Reset filters</button>';
		$(".formClass").append($(reset));
	}
}

function addWord(w){
	var en = w.en ? '<br/>'+w.en : '';
	var ur = w.ur ? '<br/>'+w.ur : '';
	var lang = "";
	var search = ''; //'<img class="bottom-left" onclick="loadSearch(\''+w.past+'\')" src="images/lookup.jpg" ></img>';
	if(parent == undefined || parent.getLang == undefined){
		lang = ", 'en'";
		search = "";
	}
	var past = '<a href="#" style="text-decoration: none;cursor:pointer;" onclick="loadSearch(\''+w.past+'\')">'+w.past+'</a>';
	var present = '<a href="#" style="text-decoration: none;cursor:pointer;" onclick="loadSearch(\''+w.present+'\')">'+w.present+'</a>';
	var form = '<a href="#" style="text-decoration: none;cursor:pointer;">'+w.form+'</a>';
	var wdiv = '<div class="word">('+form+')&nbsp;<b>'+past+"&nbsp;-&nbsp;"+present+'</b>'+en+ur+search+'</div>';

	$(".dictionary").append($(wdiv));
}

function addFormFilter(f){
	var current = formFilters.filter(item => item === f);
	current = current.length > 0 ? ' class="formFilter" ' : '';
	var fdiv = '<label id="'+f+'" '+current+' onclick="toggleForm(\''+f+'\')" >'+f+'</label>';
	$(".formClass").append($(fdiv));
}

function lookUp(w, lang){
	if(parent){
		if (lang == undefined)
			lang = parent.getLang();
		parent.window.open("https://glosbe.com/ar/"+lang+"/"+encodeURI(w), '_blank');
	}else{
		if (lang == undefined)
			lang = 'en';
		window.open("https://glosbe.com/ar/"+lang+"/"+encodeURI(w), "_blank");
	}
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
	console.log(formFilters);
	loadDictionary(lastIndex);
}

function resetFilters(){
	formFilters = [];
	loadDictionary(lastIndex);
}

function loadSearch(w, quran){
	var text = arRemovePunct(w);
	if(quran){
		var url = encodeURI(getLocationPath() + '?search='+text);
		parent ? parent.window.open(url, '_blank') : window.open(url, '_blank');
	}else{
		$("#wordSearchText").val(text);				
		var inp = document.getElementById('wordSearchText');
		fireInputEvent(inp);
	}
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
		var fileUrl = getLocationPath() + "arabic.dic/" + file[0][1] + ".json";
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