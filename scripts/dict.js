//
//	Author: munawwar_ali@yahoo.com
//

var lastSuggestionInput = undefined;
var pos = {};
var mappings = {};
var dict = {};
var lastIndex2 = undefined;
var lastIndex = undefined;
var formFilters = [];
var index2Suffixes = ["آ","إ","أ","ا","ؤ","و","ئ","ي","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه"];
window.onload = function(){
	 
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
	
	var posUrl = getLocationPath() + 'data/grmr/pos.json'
	loadJsonData(posUrl, function(data){
			pos = data;
	});
	 
	var url = getLocationPath() + 'data/grmr/dict.json';
	loadJsonData(url, function(data){
			dict = data;
			for (const [key, value] of Object.entries(dict)){
			  addIndex(key);
			}
			$(".index").append($('<div id="btnindex" class="btnl" onclick="toggleIndex(\'index\')">Collapse</div>'));
			toggleIndex('index');
	});
}

function analyzeSelectedWord(){
	
	tableCount = 0;
	$(".dictionary").empty();
	
	var word = $("#wordSearchText").val();
	for (const keyVal of Object.entries(pos)){
		var patternInfo = keyVal[1];
		
		if(patternInfo.ignore == true){
			continue;
		}
		
		var canSkip = false;
		if(patternInfo.skip){
			patternInfo.skip.every(function(exp){
				if(word.match(new RegExp(exp, 'ig'))){
					canSkip = true;
					return false;
				}
				return true;
			});
		}
		if(!canSkip){
			for (const mKeyVal of Object.entries(patternInfo.matches)){
				var parseInfo = [];
				var currentTable = undefined;
				var entryName = mKeyVal[0];
				for (const eKeyVal of Object.entries(mKeyVal[1])){
					var aword = word;
					var matchInfo = eKeyVal[1];
					
					if(matchInfo.ignore == true){
						continue;
					}
					
					canSkip = false;
					if(matchInfo.skip){
						matchInfo.skip.every(function(exp){
							if(aword.match(new RegExp(exp, 'ig'))){
								canSkip = true;
								return false;
							}
							return true;
						});
					}
					
					if( !canSkip){
						var expressions = [matchInfo.exp];
						if(matchInfo.xforms){
							var additionExpressions = matchInfo.xforms.filter(function(x){ return x.exp;})
																	  .map(function(x){ return x.exp;});
							expressions = expressions.concat(additionExpressions);
						}
						
						var isMatch = false;
						var matchExp = "";
						var replaceExp = matchInfo.rexp;
						expressions.every(function(exp){
							if(aword.match(new RegExp(exp, 'ig'))){
								isMatch = true;
								matchExp = exp;
								if(exp.rexp) replaceExp = exp.rexp;
								return false;
							}
							return true;
						});
							
						if(isMatch){
							console.log("Pattern matched:"+ eKeyVal[0]);
							if(matchInfo.rexp){
								aword = aword.replace(new RegExp(matchExp, "ig"), matchInfo.rexp);
							}
							parseInfo.push(
							{
								"w": aword, 
								"p" : { 
									"form": entryName,
									"pattern": eKeyVal[0], 
									"pos": patternInfo.pos, 
									"en": patternInfo.en, 
									"ar": patternInfo.ar,
									"num": (entryName == "singular" || entryName == "plural")  ? entryName : ""
								}
							});
							
							if(matchInfo.xforms){
								matchInfo.xforms.every(function(xform){
									var w = aword.replace(new RegExp(matchInfo.exp,'ig'), xform.rexp);
									parseInfo.push({
										"w": w, 
										"p": {
											"form": entryName,
											"pattern": xform.form,
											"pos": patternInfo.pos,
											"en": xform.en ??  patternInfo.en,
											"ar": xform.ar ??  patternInfo.ar,
											"num": xform.num ?? (entryName == "singular" || entryName == "plural")  ? entryName : ""
										}
									});
									return true;					
								 });
							}
						}
					}
				}
				
				/*
				Create table
				*/
				var sorted = parseInfo.sort(function(a,b){
					var v1 = a.p.en ?? a.p.pos ?? "";
					var v2 = b.p.en ?? b.p.pos ?? "";
					
					if(v1.includes("noun") && !v2.includes("noun")){
						return -1;
					}
					if(!v1.includes("noun") && v2.includes("noun")){
						return 1;
					}
					// if (v1 < v2) return -1;
					// if (v1 > v2) return 1;
					return 0;
				});
				
				var first = undefined;
				for (const kv of Object.entries(parseInfo)){
					if(first == undefined)
						first = kv[1].p;
					if(currentTable == undefined){
						currentTable = newTablle();
					}
					addParsedWords(currentTable, kv[1].w, kv[1].p);
				}
				
				// Hide ver/noun specific columns
				if(first){
					var table = document.getElementById(currentTable);
					for (const kv of Object.entries(table.rows)){
						var row = kv[1];
						if(first.pos == "verb"){
							row.cells[5].classList.toggle("hidden");
						}
						if(first.pos == "noun"){
							row.cells[6].classList.toggle("hidden");
						}
					}
				}
			}
		}
	}
	
	if(tableCount === 0){
		$(".dictionary").html('Cannot analyse, make sure the word is correct.');
	}
}

var tableCount = 0;
function newTablle(){
	tableCount++;
	var id = 'wt'+tableCount;
	var alink = '<div id="div'+id+'" style="text-align: center">'+
				'<a style="text-align: center;font-size:14px;maegin:auto; padding-left:10px; padding-right:10px;" href="#" '+
				   'onclick="toggleTableDiv(\''+id+'\');">Hide</a>'+
				   '<table id="'+id+'" class="wTable"><tr>'+
							 '<th style="font-size: 14px;">Word</th>'+
							 '<th style="font-size: 14px;">Form</th>'+
							 '<th style="font-size: 14px;">Pattern</th>'+
							 '<th style="width: 50px;">رفع</th>'+
							 '<th style="width: 50px;">نصب</th>'+
							 '<th style="width: 50px;">جر</th>'+
							 '<th style="width: 50px;">جزم</th>'+
							 '<th>صيغة</th>'+
							 '<th style="font-size: 14px;">PoS</th>'+
							 '</tr></table>'+
				'</div>';
	$(".dictionary").append($(alink));
	return id;
}

function addParsedWords(currentTable, word, pInfo){
	var isPastTense = pInfo.en.startsWith("past ");
	var colSpan = isPastTense ? " colspan=3 " : "";
	var row = '<tr><td>'+word+'</td>'+
				  '<td>'+pInfo.form+'</td>'+
				  '<td>'+pInfo.pattern+'</td>';
	if(isPastTense){
		row = row+ '<td>'+word+'</td>'+ 
				   '<td>'+word+'</td>'+
				   '<td></td>'+
				   '<td>'+word+'</td>';
	}else{
		row = row+ '<td>'+makeRafa(word, pInfo.pos, pInfo.en)+'</td>'+
				   '<td>'+makeNasab(word, pInfo.pos, pInfo.en)+'</td>';
		if(pInfo.pos === "noun")
			row = row+'<td>'+makeJar(word, pInfo.pos, pInfo.en)+'</td>';
		else 
			row = row+'<td></td>';
		if(pInfo.pos === "verb")
			row = row+ '<td>'+makeJazm(word, pInfo.pos, pInfo.en)+'</td>';
		else
			row = row+'<td'+colSpan+'></td>';
	}
	row = row+ '<td><span style="font-size: 16px;">'+pInfo.ar+'</span></td>'+
			   '<td><span style="font-size: 12px;">'+pInfo.pos+' - '+pInfo.en+'</span></td>'+
			   '</tr>';
	$("#"+currentTable+" tbody").append($(row));
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
		btn.innerHTML = "Expand";
	else
		btn.innerHTML = "Collapse";
}

const COLUMN_FORM=2;
const COLUMN_POS=8;

function toggleTableDiv(id){
	
	var showText = "Show";
	var val = $('#'+id+' td:nth-child('+COLUMN_FORM+')').first().text();
	if(!val.startsWith("Form")){
		val = $('#'+id+' td:nth-child('+COLUMN_POS+')').first().text();
		showText = val + " Show";
	}else{
		showText = "Show " + val;
	}
	$("#"+id).toggle();
	var alink = $("#div"+id+" a");
	if(alink.text() == "Hide")
		alink.text(showText);
	else
		alink.text("Hide");
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