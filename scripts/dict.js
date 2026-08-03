//
//	Author: munawwar_ali@yahoo.com
//

var lastSuggestionInput = undefined;
var dict = {};
var posAPIObj, cmpAPIObj, posSearchObj;
var dState = {};
var params = { "action": undefined, data: undefined };

window.onload = function () {

	params["action"] = decodeURI(getParamValue('action'));
	params["data"] = arRemovePunct(decodeURI(getParamValue('data')));

	posAPIObj = new posAPI(getLocationPath(), function (msg, err) {
		if (err) {
			console.log("Failed to initialize pos api");
			return;
		}

		posSearchObj = new posSearch(getLocationPath(), function (msg, err) {
			if (err) {
				console.log("Failed to initialize pos search api");
				return;
			}

			if (params.action && params.action !== 'cmp') {
				if(posSearchObj){
					handleParams();
				}
				else{
					setTimeout(function(){
						handleParams();
					}, 500);
				}
			}
		});
	});

	cmpAPIObj = new cmpAPI(getLocationPath(), function (msg, err) {
		if (err) {
			console.log("Failed to initialize cmp api");
			return;
		}
		if (params.action === 'cmp') {
			if(cmpAPIObj){
				handleParams();
			}
			else{
				setTimeout(function(){
					handleParams();
				}, 500);
			}
		}
	});

	autocomplete(document.getElementById('wordSearchText'), function (val, callback) {
		var condition = val.length > 1 && val !== lastSuggestionInput;
		if (val.length > 1 && val !== lastSuggestionInput) {
			lastSuggestionInput = val;
			getSuggesstions(val, callback);
		}
		return condition;
	});

	ensureJsonData({name: "mappingsData"});
	ensureJsonData({name: "ai-prompts"});

	$("#wordSearchText").keyup(function (event) {
		if (event.keyCode === 13) {
			$("#SearchD").click();
		}
	});

	if (isOS('Android')) {
		$("img[src='images/kybd.jpg']").hide();
	}
}

function selectAndTrigger(data, filterClass) {
	var d = data ? data.toLowerCase() : data;
	if(d.startsWith("pos:")){
		var index = parseInt(d.substring(4));
		setTimeout(function () {
			selectIndexAndTrigger(index, 'nFilter');
		}, 150);
		return;
	} 

	const select = document.getElementsByClassName(filterClass)[0];
	if(select){
		for (let i = 0; i < select.options.length; i++) {
			if (arRemovePunct(select.options[i].value).toLowerCase().includes(d)) {
				$("." + filterClass).val(select.options[i].value);
				$("." + filterClass).trigger('onchange');
			}
		}
	}
}

function selectIndexAndTrigger(index, filterClass) {
	const select = document.getElementsByClassName(filterClass)[0];
	$("." + filterClass).val(select.options[index].value);
	$("." + filterClass).trigger('onchange');
}

function loadWord(txt) {
	$("#wordSearchText").val(txt);
	analyzeSelectedWord();
}

function handleParams() {

	var action = params["action"];
	switch (action) {

		case 'defs':	
			if(params["data"]){
				var bookmark=params["data"].replace("def:","#bm_"); 
				listDefinitions(bookmark);
			}
		break;

		case 'analyze':
			var word = params["data"];
			if (word && word.trim()) {
				loadWord(word);
			}
			break;

		case 'vtab-all': showVerbTable(); break;
		case 'vtab-3': showTriliteralVerbTable(); break;
		case 'vtab-inad': showInadequateVerbTable(); break;
		case 'vtab-weak': showWeakVerbTable(); break;
		case 'vtab-imp': showImperativeTable(); break;

		case 'noun-pat':
			showNounTable();
			if (params["data"]) {
				selectAndTrigger(params["data"], 'nFilter');
			}
			break;

		case 'five-noun':
			showFiveNouns('ism', 'اسماءُ الخَمسة', 'Five Nouns');
			break;

		case 'pronoun':
			showPronounInfo('ism', 'ضَمائر', 'Pronouns');
			var sel = decodeURI(params["data"]);
			if (sel) {
				$(".pronounFilter").val(sel);
				filterPronounView();
			}
			break;
		case 'noun-plural':
			loadArabicLTTable('plural.csv', 'ism', 'الجمع', 'Plural');
			break;
		case 'noun-syn':
			loadArabicLTTable('synonyms.csv', 'ism', 'المرادفات', 'Synonyms');
			break;
		case 'noun-ant':
			loadArabicLTTable('antonyms.csv', 'ism', 'المتضادات', 'Antonyms');
			break;

		case 'metonymy':
			setTimeout(function () {
				showMetonymies();
				if (params["data"])
					selectAndTrigger(params["data"], 'nFilter');
			});
			break;

		case 'prep':
			setTimeout(function () {
				showParticleTable();
				if (params["data"])
					selectAndTrigger(params["data"], 'nFilter');
			});
			break;

		case 'prep-ph':
			showPrepPhrasesTable();
			if (params["data"] && params["data"] != '@Key') {
				if (params["data"].startsWith("pos:")) {
					var index = parseInt(params["data"].substring(4));
					setTimeout(function () {
						selectIndexAndTrigger(index, 'nFilter');
					}, 150);
				}
				else{
					var table = $('#pTable:visible');
					const exp = new RegExp("(?:^|[a-z\\s])" + params["data"] + "(?:$|[a-z\\s])", 'ig');
					table.find('tr').filter(function (n, el) {
						if (!exp.test($(el).text()))
							$(el).hide();
					});
					$(".nFilter").hide();
				}
			}
			break;

		case 'verbType':
			setTimeout(function () {
				showObjectEffects('verb','Verb Types', 'انواع لاأفعال', 'verbTypeData');
				if (params["data"])
					if (params["data"].startsWith("pos:")) {
						var index = parseInt(params["data"].substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(params["data"], 'pronounFilter');
			});
			break;

		case 'masdar':
			setTimeout(function () {
				showObjectEffects('ism', 'المصادر', 'Verbal Nouns', 'masdarData');
				if (params["data"])
					if (params["data"].startsWith("pos:")) {
						var index = parseInt(params["data"].substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(params["data"], 'pronounFilter');
			});
			break;

		case 'obj-effect':
			setTimeout(function () {
				showObjectEffects('ism', 'المفاعيل', 'Object', 'objectEffectsData');
				if (params["data"])
					if (params["data"].startsWith("pos:")) {
						var index = parseInt(params["data"].substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(params["data"], 'pronounFilter');
			});
			break;

		case 'adj':
		case 'adv':
			
			setTimeout(function () {
				showObjectEffects('ism', 
					action == 'adj'? 'صفات':'ظُرُوف',
					action == 'adj'? 'Adjectives' : 'Adverbs', 
					action == 'adj'? 'adjectiveData': 'adverbData');
				if (params["data"])
					if (params["data"].startsWith("pos:")) {
						var index = parseInt(params["data"].substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(params["data"], 'pronounFilter');
			});
			break;

		case 'cmp':
			var data = params["data"];
			if (data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showComparisions(index);
				selectIndexAndTrigger(index, 'nFilter');
			}
			else showComparisions(0);
			break;

		case 'sentence':
			var data = params["data"];
			if (data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showSentenceComparisions(index);
			} else {
				showSentenceComparisions(0);
			}
			break;

		case 'noun-cmp':
			var data = params["data"];
			if (data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showNounComparisions(index);
			} else {
				showNounComparisions(0);
			}
			break;

		case 'imp-verb':
			var pos = 0;
			var data = params["data"];
			if (data.startsWith("pos:")) {
				pos = parseInt(data.substring(4));
			}
			showImperativeTable(null, pos);
			break;

		case 'weak-verb':
			var pos = 0;
			var data = params["data"];
			if (data.startsWith("pos:")) {
				pos = parseInt(data.substring(4));
			}
			showWeakVerbTable(null, pos);
			break;

		case 'q-examples':
			listExamplesFromQuran();
			toggleDropdownContent($(this).parent().prev());
			break;

		default:
			listSearchIndex();
			toggleDropdownContent($(this).parent().prev());
			break;
	}
}

function showVerbTable() {
	var vTable = posAPIObj.getVerbInfo();
	posAPIObj.addVerbInfoHtml($(".dictionary"), vTable);
}

function showMetonymies() {
	var mTable = posAPIObj.getMetonymies();
	posAPIObj.addMetonymyHtml($(".dictionary"), mTable);
}

function showParticleTable() {
	var pTable = posAPIObj.getParticleInfo();
	posAPIObj.addParticleInfoHtml($(".dictionary"), pTable);
}

function showPrepPhrasesTable() {
	var pTable = posAPIObj.getPerpPhraseInfo();
	posAPIObj.addPrepPhrasesInfoHtml($(".dictionary"), pTable);
}

function checkWord(w) {
	$("#wordSearchText").val(w);
}

function analyzeSelectedWord() {

	var word = $("#wordSearchText").val();
	posSearchObj.searchAndAddHtml(word, $(".dictionary"));
}

function analyzeSelectedWordOld() {

	var word = $("#wordSearchText").val();

	var res = posAPIObj.analyzeWord(word, true);
	posAPIObj.addHtml($(".dictionary"), res, true);
}

function loadExamplesFromCmpData(dict, qselect) {
	if (!cmpAPI || !cmpAPI.cmpData || !cmpAPI.cmpData.length) {
		return;
	}

	var examples = {};
	cmpAPI.cmpData.forEach(function (item) {
		var features = item && item.features;
		if (!features) {
			return;
		}

		Object.entries(features).forEach(function ([key, value]) {
			if (!Array.isArray(value)) {
				return;
			}

			var matches = value.filter(function (v) {
				return /\[\d+\:\d+\]/ig.test(v);
			});

			if (!matches.length) {
				return;
			}

			examples[key] = examples[key]
				? examples[key] + "<br/>" + matches.join("<br/>")
				: matches.join("<br/>");
		});
	});

	var html = '<div style="font-size:12px;width:100%;text-align:center;">';
	Object.entries(examples).forEach(function ([key, value]) {
		var keyExamples = String(value).split('<br/>');
		var div = keyExamples
			.filter(function (ex) {
				return /\[\d+\:\d+\]/ig.test(ex);
			})
			.map(function (ex) {
				return `
					<p style="font-size:10px;">
						${replaceQLink(ex.replaceAll('e.g.', ''))}
					</p>`;
			})
			.join('');

		if (div === '') {
			return;
		}

		var kval = arRemovePunct(key)
			.replaceAll(' ', '_')
			.replaceAll('(', '')
			.replaceAll(')', '')
			.replaceAll('/', '');
		qselect.append(`<option value="${kval}">${key}</option>`);
		html += `
			<div id="qid_${kval}" 
				style="margin:auto;padding:10px;width:100%;display:inline-block;">
				<p>${key}</p>
				${div}
			</div>`;
	});
	html += '</div>';
	dict.append($(html));
}

function loadExamplesFromDefinitions(dict, qselect, data){
	if (data) {
		var examples = data;
		var html = '<div style="font-size:12px;width:100%;text-align:center;">';
		// Display examples
		Object.entries(examples).filter(function ([key, value]) {
			var div = '';
			if(value.examples){
				value.examples.every(function (ex, i) {
					if (/\[\d+\:\d+\]/ig.test(ex)) {
						div += `<p style="font-size:10px;">${replaceQLink(ex)}</p>`;
					}
					return true;
				});
			}
			if(value.types){
				value.types.map(function (v, i) {
					if(v.examples)
					{
						v.examples.every(function (ex, i) {
							if (/\[\d+\:\d+\]/ig.test(ex)) {
								div += `<p style="font-size:10px;">${replaceQLink(ex)}</p>`;
							}
						});
					}
				});
			}
			if (div !== '') {
				var kval = arRemovePunct(value.name_ar ?? key)
					.replaceAll(' ', '_')
					.replaceAll('(', '')
					.replaceAll(')', '')
					.replaceAll('/', '');
				qselect.append(`<option value="${kval}">${value.name_ar ?? `${key} (${value.en})`}</option>`);
				html += `
				<div id="qid_${kval}" 
					style="margin:auto;padding:10px;width:100%;display:inline-block;">
					<p>${value.name_ar ?? `${key} (${value.en})`}</p>
					${div}
				</div>`;
			}
		});
		html += '</div>';
		dict.append($(html));
	}
}

function loadExamplesFromObjectEffectData(dict, qselect, data) {
	if (data) {
		var examples = data;
		var html = '<div style="font-size:12px;width:100%;text-align:center;">';
		// Display examples
		Object.entries(examples).filter(function ([key, value]) {
			var div = '';
			value.examples.every(function (ex, i) {
				if (/\[\d+\:\d+\]/ig.test(ex)) {
					div += `<p style="font-size:10px;">${replaceQLink(ex)}</p>`;
				}
				return true;
			});
			if (div !== '') {
				var kval = arRemovePunct(value.name_ar)
					.replaceAll(' ', '_')
					.replaceAll('(', '')
					.replaceAll(')', '')
					.replaceAll('/', '');
				qselect.append(`<option value="${kval}">${value.name_ar}</option>`);
				html += `
				<div id="qid_${kval}" 
					style="margin:auto;padding:10px;width:100%;display:inline-block;">
					<p>${value.name_ar}</p>
					${div}
				</div>`;
			}
		});
		html += '</div>';
		dict.append($(html));
	}
}

function loadExamplesFromData(dict, qselect, data, prefix) {
	var impExamples = data;
	if (!prefix) prefix = '';
	if (impExamples) {
		var examples = impExamples;
		var html = '<div style="font-size:12px;width:100%;text-align:center;">';
		// Display examples
		Object.entries(examples).filter(function ([key, value]) {
			var div = '';
			var values = value.match ? [value] : value;
			values.every(function (ex, i) {
				if (/\[\d+\:\d+\]/ig.test(ex)) {
					div += `<p style="font-size:10px;">${
						replaceQLink(value+'').replaceAll(']', ']<br/><br/>')
					}</p>`;
				}
			});
			
			if (div !== '') {
				var kval = arRemovePunct(prefix + key).replaceAll(' ', '_');
				qselect.append(`<option value="${kval}">${prefix} ${key}</option>`);
				html += `
				<div id="qid_${kval}" 
					style="margin:auto;padding:10px;width:100%;display:inline-block;">
					<p>${prefix} ${key}</p>
				${div}
				</div>`;
			}
		});
		html += '</div>';
		dict.append($(html));
	}
}

function listExamplesFromQuran(selText) {
	var dict = $(".dictionary");
	dict.empty();
	// Add select
	var qselect = $(`
		<select id="qs1" style="text-align:center;"
			onchange=" 
			$('div [id*=qid_]').hide();
			if($(this).val() == 'ALL'){ 
				$('div [id*=qid_]').show()
			}else{
				var id = arRemovePunct($(this).val()).replaceAll(' ','_');
				$('div [id=qid_'+id+']').show();
			}
			">
		</select>
		`);
	qselect.append('<option value="ALL">ALL</option>');
	dict.append(qselect);
	dict.prepend($(`
		<button class="nFilterBtn" 
			style="width:100%;"
			onclick="listQListItems('.dictionary', '#qs1')">List</button>`));

	loadExamplesFromCmpData(dict, qselect);
	ensureJsonData({name:"objectEffectsData"})
	.then((data) => {
		loadExamplesFromObjectEffectData(dict, qselect, data);
	});
	ensureJsonData({name:"adverbData"})
	.then((data) => {
		loadExamplesFromObjectEffectData(dict, qselect, data);
	});
	ensureJsonData({name:"def-data"})
	.then((data) => {
		loadExamplesFromDefinitions(dict, qselect, data);
	});
	loadExamplesFromData(dict, qselect, showImperativeTable(1), "Imperative - Form ");
	loadExamplesFromData(dict, qselect, showWeakVerbTable(1), "Weak Verbs ");
	loadExamplesFromData(dict, qselect, get_ce_examples());

	if(selText){
		setTimeout(function(){
			$("#qs1").val(selText);
			if($("#qs1").val() !== ''){
				$("#qs1").trigger('change');
			}
		},40);
	}
}

function handleFilterAction(val, action){
	if (action !== ''){
		handleFilterIndex(val);
		$("div[data_action]:not([data_action*='"+action+"'])").hide();
	}
	else{
		$("div[data_action]").show();
		handleFilterIndex(val);
	}
}

function handleFilterIndex(val){
	if (val == 'id_ع'){
		$("div [id*=id_]").hide();
		$("div [id*=data_]").show();
	}
	else{
		$("div [id*=data_]").hide();
		$("div [id*=id_]").hide();
		if(val == "id_") 
			$("div [id*=id_]").show();
		else
			$("div [id="+val+"]").show();
	}
}

function listDefinitions(bk){
	var container = $(".dictionary");
	ensureJsonData({name:'def-data'})
	.then((data) => {
		container.empty(); 
		container.append($(`
			<select id="defFilter" 
					style="text-align: center;text-align-last: center;padding:6px;"
			        onchange="window.open(this.value, '_self')"></select>`));
		var defSelect = $("#defFilter");
		
		container.append($(`<table id="defTable" 
				style="text-align:center;"><tbody></tbody></table>`));
		var table = $("#defTable tbody");
		Object.keys(data)
		      .sort()
			  .forEach(function(key) {
				var entry = data[key];
				table.append($(
				`<tr><td id="bm_${key}" style="border:none; border-bottom: 2px solid black;">
				<a href="#defFilter">[&#8593]</a>&nbsp;&nbsp;
				<b style="background-color:#F0F0A0">${key} (${entry.en})</b>
				&nbsp;&nbsp<a href="#" 
				   onclick="openGoogleAISearch(
							getPromptFromKey(['Definitions'], 
									{'0': ['${key} (${entry.en})', 
									        '${entry.types && entry.types.length > 0 ? 
												entry.types.map(x=>`${x.name}(${x.en})`).join(","):
												"find out types"}',
									        '${entry.def})']}, 
									true));">[AI]</a>
				<p style="directoin:ltr;padding:2px;">${entry.def}</p>
				${entry.ref ? ':<u>References</u><br/>' : ''}
				${entry.ref ? `
					<div style="text-align:center;display:inline-flex;padding-bottom:6px;">
					${entry.ref.map(ex => `<a style="padding-left:20px;padding-right:20px;" href="#bm_${ex}" >${ex}</a>`).join('<br/>')}
					</div>`: ''}
				<div style="background-color:lightgray;">${entry.examples ? entry.examples.map(ex => `${replaceQLink(ex)}</br/>`).join(''): ''}</div>
				${entry.types ? '<ul>' : ''}
				${entry.types ? entry.types.map(t => `
					<li style="list-style-type: none;">
					<u style="background-color:lightgray;">${t.name} (${t.en})</u><br/>
					${t.examples ? t.examples.map(ex => `${replaceQLink(ex)}</br/>`).join('<br/>'): ''}
					</li><br/>
					`).join(''): ''}
				${entry.types ? '</ul>' : ''}
				</td></tr>`));
				defSelect.append($(`<option value="#bm_${key}">${key} (${entry.en})</option>`)) 
			  }
			);

			if(bk){
				window,open(bk, '_self');
			}
	});
}

function listSearchIndex(indexKey='') {
	ensureJsonData({name:'isearchData'})
	.then((data) => {
		$(".dictionary").empty();
		$(".dictionary").append('<div style="margin-top: 40px;"></div>');

		//sort by key
		var arSortedData = {}, arSortedDataOriginalKeys = {}, sortElements = {};
		const enSortedData = Object.keys(data)
			.sort()
			.reduce((tempObj, key) => {
				//  Arabic text
				var amatch = arRemovePunct(key).match(/([\u0621-\u064A]+\s?)+/)+'';
				if(amatch.includes(','))
					amatch = amatch.split(',')[0];
				if(amatch !== "null"){
					arSortedData[amatch] = data[key];
					arSortedDataOriginalKeys[amatch]=key;
				}

				// English text
				var ematch = key.match(/([a-zA-Z0-9]+\s?)+/)+'';
				if(ematch.includes(','))
					ematch = ematch.split(',')[0];
				if(ematch !== "null"){
					tempObj[ematch] = data[key];
				}
				return tempObj;
			}, {});

		// Add Alphabetic index
		var iDiv = "<div style='text-align:left;padding:4px;'>";
		$.each([" عABCDEFGHIJKLMNOPQRSTUVWXYZ"],
			function (index, value) {
				iDiv += '<select style="width:40;" onchange="handleFilterIndex($(this).val())" >';
				for (const charValue of value) {
					iDiv += "<option value=id_" + charValue + ">" + charValue + "</option>";
				};
				iDiv += "</select>";
				iDiv += `
				Topic: <select style="width:40;" onchange="handleFilterAction($(this).prev().val(), $(this).val());">
					<option value="">All</option>
					<option value="cmp">Comparison</option>
					<option value="masdar">Verbal Noun</option>
					<option value="noun-cmp">Noun</option>
					<option value="noun-pat">Noun Patternns</option>
					<option value="adj">Adjective</option>
					<option value="adv">Adverb</option>
					<option value="pronoun">Pronoun</option>
					<option value="prep">Preposition</option>
					<option value="sentence">Sentence</option>
					<option value="Vocab">Vocabulary</option>
					<option value="Chart">Charts</option>
				</select>`;
			});

		var div = $("<div style='direction:ltr;width:100%;height=100%;'></div>");
		div.append($(iDiv));
		$.each(enSortedData, function (key, value) {
			div.append(getIndexEntry(null, key, value, 'id', 
				'cursor:pointer;margin:0;padding:0;padding-left:10px;padding-top:14px;width:220px;display:inline-block;float:left;'));
		});
		$.each(arSortedData, function (key, value) {
			var elem = getIndexEntry(arSortedDataOriginalKeys, key, value, 'data', 
				'cursor:pointer;margin:0;padding:0;padding-left:10px;padding-top:14px;width:220px;display:inline-block;float:right;'
			);
			sortElements[key] = elem;
			//div.append(elem);
		});
		// rearrange arabic index to be in the order of arabic letters
		var sortedKeys = Object.keys(sortElements).sort(function(a, b) {
			return a.localeCompare(b, 'ar');	
		});
		div.append(sortedKeys.map(function(key) {
			return sortElements[key];
		}));
		$(".dictionary").append(div);
		handleFilterIndex('id_'+indexKey)
	});
}

function getIndexEntry(keys, key, value, id, style){
	
	var originalKey = keys ? keys[key] : key;
	if(originalKey.includes(";")){
		originalKey = originalKey.split(";")[0];
	}
	var link = `
	parent.redirect('${value.path}','${value.action}',
	${
		(value.data && value.data == '@key') ? `'${originalKey}');`:
		value.data ? `'${value.data}');`: ');'
	}`;
	var icon = getIndexEntryIcon(value.path, value.action);
	return `
		<div id="${id}_${key[0]}" data_action="${value.action}"
			style="${style}">
			${icon}<a href="#" onclick="${link}">${key}</a>
		</div>
	`;
}

function getIndexEntryIcon(path, action){
	var style = "height:14px;padding:0;margin:0;display:inline";
	switch(path)
	{
		case 'charts.html':
		case 'cards.html':
			return `<img src="images/fcard.png" style="${style}}"/>`;
		default:
			break
	}
	switch(action)
	{
		case 'cmp':
		case 'noun-cmp':
		case 'sentence':
			return `<img src="images/cmp.png" style="${style}"/>`;
		
		case 'noun-plural':
		case 'noun-syn':
		case 'noun-ant':
			return `<img src="images/tab.png" style="${style}"/>`;

		default:
			break
	}
	return '';
}

function selectWord(text) {
	$("#wordSearchText").val(text);
	var inp = document.getElementById('wordSearchText');
	fireInputEvent(inp);
}

function searchWord() {
	var txt = $("#wordSearchText").val();
	getSuggesstions(txt);
}

async function getSuggesstions(txt, callback) {

	var file = Object.entries(parent.dataCache["mappingsData"].data)
					 .filter(function ([key, value]) {
		return txt.startsWith(key);
	});
	if (file.length > 0) {
		var fileUrl = getLocationPath() + 'data/ar.dic/' + file[0][1] + '.json';
		console.log('getting suggestions: ' + file[0][1] + '.json');
		loadJsonData(fileUrl).then((data) => {
			// update global var for suggestions
			var suggestionsList = data.filter(function (w) {
				return w.startsWith(txt);
			});
			if (callback) {
				callback(suggestionsList);
			}
		});
	}
}

function openMeaning() {
	var txt = $("#wordSearchText").val();
	if (txt !== null && txt !== '') {
		lookUp(txt);
	}
}

function searchInQuran() {
	var txt = $("#wordSearchText").val();
	if (txt !== null && txt !== '') {
		loadSearch(txt, true);
	}
}

function OpenInChatGPT() {
	var txt = $("#wordSearchText").val();
	var lang = parent.getLang();

	var url = "https://chatgpt.com?q=";
	var prompt = "";
	switch (lang) {
		case 'en':
			prompt = decodeURI('Generate three sample sentences using word ' + txt + ' from the Quran or Hadith and translate into English language');
			break;

		case 'ur':
			prompt = decodeURI('Generate three sample sentences using word ' + txt + ' from the Quran or Hadith and translate into Urdu language');
			break;

		case 'ar':
			prompt = decodeURI('Generate three sample sentences using word ' + txt + ' from the Quran or Hadith and translate into English and Urdu languages');
			break;
	}
	parent ? parent.window.open(url + prompt, '_blank') : window.open(url + prompt, '_blank');
}

function updateState(key, value) {
	dState[key] = value;
	for (const [k, v] of Object.entries(dState)) {
		$("#" + key + " button").text(v.ar);
		$("#" + key + " button").prop('title', v.en);
	}
}

function showNounTable(k, v1, v2) {
	updateState(k, { ar: v1, en: v2 });
	var nTable = posAPIObj.getNounInfo();
	posAPIObj.addNounInfoHtml($(".dictionary"), nTable);
}

function showComparisions(inp) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, false);
}

function showSentenceComparisions(inp) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, true, "sentence");
}

function showVerbComparisions(inp) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, true, "verb");
}

function showNounComparisions(inp) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, true, "noun");
}

function get_ce_examples() {
	return {
		"Causal Object": [
			"قُل لَّوۡ أَنتُمۡ تَمۡلِكُونَ خَزَآئِنَ رَحۡمَةِ رَبِّيٓ إِذٗا لَّأَمۡسَكۡتُمۡ <b>خَشۡيَةَ</b> ٱلۡإِنفَاقِۚ [17:100]",
			"وَعَلَّمۡنَٰهُ صَنۡعَةَ لَبُوسٖ لَّكُمۡ <b>لِتُحۡصِنَكُم</b> مِّنۢ بَأۡسِكُمۡۖ [21:80]",
			"وَكَذَٰلِكَ بَعَثۡنَٰهُمۡ <b>لِيَتَسَآءَلُواْ</b> بَيۡنَهُمۡۚ [18:19]"
		],
		"Comitative Object": [
			"فَأَجۡمِعُوٓاْ أَمۡرَكُمۡ وَ<b>شُرَكَآءَكُمۡ</b> [10:71]"
		],
		"Adverbial Object": [
			"خَٰلِدِينَ فِيهَآ <b>أَبَدًاۚ</b> [9:22]",
			"وَٱذۡكُرِ ٱسۡمَ رَبِّكَ <b>بُكۡرَةٗ</b> وَ<b>أَصِيلٗا</b> ٢٥ [76:25]",
			"وَأَقِمِ  ٱلصَّلَوٰةَ <b>طَرَفَيِ</b> ٱلنَّهَارِ وَ<b>زُلَفٗا</b> مِّنَ ٱلَّيۡلِۚ [11:114]"

		],
		"Direct Object": [
			"كَذَٰلِكَ يَضۡرِبُ ٱللَّهُ <b>ٱلۡأَمۡثَالَ</b> ١٧[13:17]",
			"لَّقَدۡ أَنزَلۡنَآ <b>ءَايَٰتٖ مُّبَيِّنَٰتٖۚ</b> [24:46]",
			"وَٱذۡكُرۡ <b>إِسۡمَٰعِيلَ وَٱلۡيَسَعَ وَذَاٱلۡكِفۡلِ</b>ۖ [38:48]"
		],
		"Absolute Effect": [
			"وَتُحِبُّونَ ٱلۡمَالَ <b>حُبّٗا جَمّٗا</b> ٢٠ [89:20]",
			"كـَلَّآۖ إِذَا دُكَّتِ ٱلۡأَرۡضُ <b>دَكّٗا دَكّٗا</b> ٢١ [89:21]",
			"وَجَآءَ رَبُّكَ وَٱلۡمَلَكُ <b>صَفّٗا صَفّٗا</b> ٢٢ [89:22]",
			"وَسِعَ رَبِّي كُلَّ شَيۡءٍ <b>عِلۡمًاۚ</b> [6:80]"
		],
		"Circumstantial": [
			"فَلَمَّا رَءَا ٱلۡقَمَرَ <b>بَازِغٗا</b> قَالَ هَٰذَا رَبِّيۖ  [6:77]",
			"فَخَرَجَ مِنۡهَا <b>خَآئِفٗا</b> يَتَرَقَّبُۖ [28:21]",
			"إِن جَعَلَ ٱللَّهُ عَلَيۡكُمُ ٱلَّيۡلَ <b>سَرۡمَدًا</b> إِلَىٰ يَوۡمِ ٱلۡقِيَٰمَةِ [28:71]"
		],
		"Disambiguitive": [
			"فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ [2:29]",
			"وَالَّذِينَ آمَنُوا أَشَدُّ حُبًّا لِّلَّهِ [2:165]",
			"إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا [12:4]"
		]
	};
}
function showCauseAndEffects(inp) {
	$(".dictionary").empty();

	var html = `
	<div style="font-size:12px;width:100%;background-color:yellow;text-align:center;">
		Click or tap on a block to see examples ( See: 
		<a href="#" onclick="showObjectEffects('ism','المفاعيل', 'Object', 'objectEffectsData')">Object Effects</a> )
	</div>
	<div style="width:100%;display:flex;flex-diection:column;text-align:center;">
		<img id="svgImg1" style="margin:auto;current:arrow;" src="images/ce.svg"></img>
	</div>
	<div id="ceExamples" style="width:100%;text-align:center;">
	</div>`;

	$(".dictionary").append($(html));

	var coords = {
		"Causal Object": [29, 30, 134, 76],
		//"Subject": [206,25,262,73],
		"Comitative Object": [353, 28, 458, 74],
		"Adverbial Object": [31, 255, 133, 303],
		"Direct Object": [201, 255, 264, 302],
		"Absolute Effect": [354, 255, 459, 301],
		//"Action": [204,144,266,185],
		//"Cause":[52,140,107,188],
		//"Effect": [375,140,430,188],
		"Circumstantial": [263.5, 199, 374.5, 237],
		"Disambiguitive": [101.5, 95, 212.5, 131263.5, 199, 374.5, 237]
	};

	var svgImg = $("#svgImg1");
	svgImg.on('load', function () {
		var isAndroid = $(".toolDiv.mobile").length > 0;
		if (isAndroid || svgImg.offset().left < 0) {
			var w1 = svgImg.prop("width");
			svgImg.css("width", "100%");
			var w2 = svgImg.prop("width");
			var factor = w2 / w1;
			//Adjust coordinates
			for (const [k, v] of Object.entries(coords)) {
				for (var j = 0; j < v.length; j++) {
					v[j] = v[j] * factor;
				}
			}
		}
	});

	svgImg.on("click", function (e) {
		console.log("on:" + activeSvgArea);
		if (activeSvgArea) {
			var exDiv = $("#ceExamples");
			exDiv.empty();
			var examples = ce_examples[activeSvgArea];
			if (examples) {

				var exHtml = '<div></div>';
				for (var i = 0; i < examples.length; i++) {
					exHtml += '<div style="margin:auto;">' + replaceQLink(examples[i]) + '</div>';
				}
				exDiv.append($(exHtml));
			}
		}
	});

	var isWorking = false;
	var activeSvgArea = undefined;
	var ce_examples = get_ce_examples();

	svgImg.on("mousemove", function (e) {

		if (!isWorking) {
			isWorking = true;
			$("#svgImg1").css('cursor', 'crosshair');
			var isSet = false;

			var offset = $(this).offset();
			var x = e.clientX - offset.left;
			var y = e.clientY - offset.top;
			for (const [k, v] of Object.entries(coords)) {
				if (x > v[0] && x < v[2] && y > v[1] && y < v[3]) {
					$("#svgImg1").css('cursor', 'pointer');
					activeSvgArea = k;
					isSet = true;
					break;
				}
			}
			activeSvgArea = isSet ? activeSvgArea : undefined;
			isWorking = false;
		}
	});
}

function loadComparision() {
	var comppSel = $("select option[class='.cmpVerb']");
	var verbCompare = comppSel.length > 0 ? comppSel.val() : '';
	cmpAPIObj.addComparisionTable(".dictionary", $(".dictionary select").val(), verbCompare);
}

function handleCompareCheck() {
	var chk = $("input");
	var sel = $("select option");
	sel.removeClass(".cmpVerb");
	if (chk.is(":checked")) {
		var selSel = $("select option:selected");
		selSel.addClass(".cmpVerb");
		$("#cmpLabel").html(selSel.val() + " Compare with ");
	}
	else {
		$("#cmpLabel").html("Compare");
	}
}

function showTriliteralVerbTable() {

	var alink = `
	<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	$(".dictionary").empty()
	var table = `
	<table class="pTable">
		<tr style="background-color:#B6D7A8;font-size:16px;">
			<th>الماضي المعلُوم</th>
			<th>المُضارع المعلوم<br/>(مُرفُوع)</th>
			<th>الماضي المجهُول</th>
			<th>المُضارع المجهُول<br/>(مُرفُوع)</th>
		</tr>
		<tr>
			<td>فَعَلَ</td><td>يَفْعَلُ</td>
			<td>فُعِلَ</td><td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#E8E885">
			<td>(${alink.replaceAll('$', 'فَتَحَ')})</td>
			<td>(${alink.replaceAll('$', 'يَفْتَحُ')})</td>
			'<td>(${alink.replaceAll('$', 'فُتِحَ')})</td>
			<td>(${alink.replaceAll('$', 'يُفْتَحُ')})</td>
		</tr>
		<tr>
			<td>فَعَلَ</td><td>يَفْعِلُ</td>
			<td>فُعِلَ</td><td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#E8E885">
			<td>(${alink.replaceAll('$', 'ضَرَبَ')})</td>
			<td>(${alink.replaceAll('$', 'يَضْرِبُ')})</td>
			<td>(ضُرِبَ)</td>
			<td>(يُضرَبُ)</td>
		</tr>
		<tr>
			<td>فَعَلَ</td>
			<td>يَفْعُلُ</td>
			<td>يَفْعُلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#E8E885">
			<td>(${alink.replaceAll('$', 'نَصَرَ')})</td>
			<td>(${alink.replaceAll('$', 'يَنْصُرُ')})</td>
			<td>(${alink.replaceAll('$', 'نُصِرَ')})</td>
			<td>(${alink.replaceAll('$', 'يُنْصَرُ')})</td>
		</tr>
		<tr>
			<td>فَعِلَ</td>
			<td>يَفْعَلُ</td>
			<td>فُعِلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#CFE2F3">
			<td>(${alink.replaceAll('$', 'سَمِعَ')})</td>
			<td>(${alink.replaceAll('$', 'يَسْمَعُ')})</td>
			<td>(${alink.replaceAll('$', 'سُمِعَ')})</td>
			<td>(${alink.replaceAll('$', 'يُسْمَعُ')})</td>
		</tr>
		<tr>
			<td>فَعِلَ</td>
			<td>يَفْعِلُ</td>
			<td>فُعِلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#CFE2F3">
			<td>(${alink.replaceAll('$', 'حَسِبَ')})</td>
			<td>(${alink.replaceAll('$', 'يَحسِبُ')})</td>
			<td>(${alink.replaceAll('$', 'حُسِبَ')})</td>
			<td>(${alink.replaceAll('$', 'يُحْسَبُ')})</td>
		</tr>
		<tr>
			<td>فَعُلَ</td>
			<td>يَفْعُلَ</td>
			<td>فُعِلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#DFB4C9">
			<td>(${alink.replaceAll('$', 'كَرُمَ')})</td>
			<td>(${alink.replaceAll('$', 'يَكْرُمُ')})</td>
			<td>(${alink.replaceAll('$', 'كُرِمَ')})</td>
			<td>(${alink.replaceAll('$', 'يُكْرَمُ')})</td>
		</tr>
	<table>`;
	$(".dictionary").append('<div style="height:10px;"></div>');
	$(".dictionary").append($(table));
}

function showInadequateVerbTable() {

	var alink = `
	<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	$(".dictionary").empty();
	var table = `
	<table class="pTable">
		<tr style="background-color:#E8E885;">
			<td><b>توقيت (Timing)</b></td>
		</tr>
		<tr style="background-color:#E8E885;">
			<td>to become / to change<br/>
			${
				alink.replaceAll('$', 'أصبَح') + ' / ' +
				alink.replaceAll('$', 'أَمسَ') + ' / ' +
				alink.replaceAll('$', 'ظَلّ') + ' / ' +
				alink.replaceAll('$', 'بَاتَ') 
			}
			</td>
		</tr>
		<tr>
			<td>اصبَحَ الطَّقَسُ جَمِيلَةً<br/>The weather has become beautiful<br/>بَاتَ المَريضُ جَادًا<br/>The patient became (in night) seriosly ill
			<br/>
			<a href="#" onclick="openGoogleAISearch(getPromptFromKey(['InadequateVerbs'], {'0': ['توقيت']}, true))">More</a>
			</td>
		</tr>
		<tr style="background-color:#E8E885;">
			<td><b>تحويل (Transition)</b></td>
		</tr>
		<tr style="background-color:#E8E885;">
			<td>to tansition / become<br/>
			${alink.replaceAll('$', 'صَارَ')} / صَارَ إِلَي
			</td>
		</tr>
		<tr>
			<td>صَارَ الماءُ جَليِدًا<br/>The water became ice<br/>صارَ إلَي لِصٍّ<br/>He beame a thief
			<br/>
			<a href="#" onclick="openGoogleAISearch(getPromptFromKey(['InadequateVerbs'], {'0': ['تحويل']}, true))">More</a>
			</td>
		</tr>
		</tr>
		<tr style="background-color:#E8E885;">
			<td><b>نفي (Negation)</b>
			</td>
		</tr>
		<tr style="background-color:#E8E885;">
			<td>لَيسَ</td>
		</tr>
		<tr>
			<td>أَلَيْسَ الصُّبْحُ بِقَرِيبٍ [11:81]<br/>Is not the morning approaching?<br/>لَيسَ المُعَلِّمُ حاضِرًا<br/>The teacher is not present
			<br/>
			<a href="#" onclick="openGoogleAISearch(getPromptFromKey(['InadequateVerbs'], {'0': ['نفي']}, true))">More</a>
			</td>
		</tr>
		<tr style="background-color:#E8E885;">
			<td><b>استمرار (Continuation)</b>
			</td>
		</tr>
		<tr style="background-color:#E8E885;">
			<td>to remain / continue<br/>مَازالَ / مابَرِحَ / ماأنفَكَّ
			</td>
		</tr>
		<tr>
			<td>مابرح الجوء لَطيفًا<br/>Weather is still nice<br/>مازال الطِّفلُ نَائمًا<br/>The baby is still asleep
			<br/>
			<a href="#" onclick="openGoogleAISearch(getPromptFromKey(['InadequateVerbs'], {'0': ['استمرار']}, true))">More</a>
			</td>
		</tr>
		<table>`;
	$(".dictionary").append('<div style="height:10px;"></div>');
	$(".dictionary").append($(table));
}

function showWeakVerbTable(d, ii) {
	var alink = `
	<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	var nawaqis = {
		'مِثال': {
			info: [
				"(يَفعَلُ) يَوجِدُ => يَجِدُ<br/>(يَفعِلُونَ) يَوذِرُونَ => يَذِرُونَ", 
				"ف كلمة => ا و ي", "(و ج د)"
			],
			examples: [
				"وَمَن يَلْعَنِ اللَّهُ فَلَن تَجِدَ لَهُ نَصِيرًا [4:52]",
				"رَبَّنَآ ...  وَقِنَا   عَذَابَ   ٱلنَّارِ [3:16]",
				"فَلۡيَتَّقُواْ   ٱللَّهَ   وَلۡيَقُولُواْ   قَوۡلٗا   سَدِيدًا [4:9]"
			]
		},
		'أَجوَف': {
			info: [
				"(فَعَلَ) قَوَلَ => قَالَ<br/>(فُعِلَ) قُوِلَ => قِيلَ", 
				"ع كلمة => ا و ي", "(ق و ل)"],
			examples: [
				"وَأَن تَصُومُوا خَيْرٌ لَّكُمْ [2:184]",
				"قَالَ   إِنَّمَآ   أَنَا۠   رَسُولُ   رَبِّكِ [19:19]",
				"لَن   تَنَالُواْ   ٱلۡبِرَّ   حَتَّىٰ   تُنفِقُواْ   مِمَّا   تُحِبُّونَۚ [3:92]"
			]
		},
		'نَاقِص': {
			info: [
				"(فَعَلُوا) رَضَيُوا=> رَضُوا",
				"ل كلمة => ا و ي","(ر ض ي)"],
			examples:[
				"رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ [5:119]",
				"أُجِيبُ   دَعۡوَةَ   ٱلدَّاعِ   إِذَا   دَعَانِۖ [2:186]",
				"اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ [1:6]"
			]
		},
		'لَفِيف': {
			info: ["(اِفتَعَلَ) إوتَقَيَ => إتْتَقَي => إتَّقَي<br/>(فَعِلنَا) وَقِينَا=> وَقِنَا", 
				"و/ي root has", 
				"(و ق ي)"],
			examples: [
				"وَقِنَا عَذَابَ النَّارِ [3:16]",
				"يَوۡمَ نَطۡوِي  ٱلسَّمَآءَ كَطَيِّ ٱلسِّجِلِّ لِلۡكُتُبِۚ [21:104]",
				"وَتَعِيَهَآ   أُذُنٞ   وَٰعِيَةٞ [69:12]"
			]
		},
		'مَهمُوز': {
			info: [
				"(فَعَلُوا) رَأَيُو => رَأَو<br/>(يَفعَلُ) يَاكُلُ [Exception]", 
				"root has hamza", "(أ ك ل)"],
			examples: [
				"وَلَئِنْ أَرْسَلْنَا رِيحًا فَرَأَوْهُ مُصْفَرًّا [30:51]",
				"سَأَلَ   سَآئِلُۢ   بِعَذَابٖ   وَاقِعٖ [70:1]",
				"فَلَمَّا   رَءَا   ٱلۡقَمَرَ   بَازِغٗا [6:77]"
			]
		}
	};

	if(d){ //return data when inline call
		return Object.assign({}, ...$.map(nawaqis, function(value, key) {
			var obj = {};
			obj[key] = value.examples;
			return obj;
		}));
	}

	$(".dictionary").empty();
	var filters = [];
	$(".dictionary").append('<div style="height:10px;"></div><div style="width:100%; text-align:center">حرف العِلَّت When root of a word has one or more </div>');
	var index = 0;
	$.each(nawaqis, (k, v)=>{
		index++;
		var table = `
		<table class="mTable" id="mTable${index}">
		<tr style="width:100%">
			<td style="background-color:#E8E885;">
				<b>${k}</b>
			</td>
			<td rowspan="3" style="min-width:200px;">${v.info[0]}<br/>
			<a href="#" title="AI search" style="font-size:14px;" onclick="openGoogleAISearch(
						getPromptFromKey(['WeakVerbs'], {'0': ['${k}}']}, true))">More</a>
			</td>
		</tr>
		<tr style="background-color:#E8E885;">
			<td>${v.info[1]}</td>
		</tr>
		<tr>
			<td>${v.info[2]}</td>
		</tr>
		<tr>
			<td colspan="2" style="border:none">
			<br/>${v.examples.map((ex) => replaceQLink(ex, false)).join('<br/>')}<br/><br/>
			</td>
		</tr>
		<table>`;
		$(".dictionary").append($(table));
		
		//Add filter
		filters.push(k);
	});

	// Add filter drop down
	if (filters.length > 0) {
		$(".dictionary").prepend($(getListButtinWithSelect(`
			<select class="nFilter" onchange="filterMTableRows('mTable', $('.nFilter').prop('selectedIndex'), $('.nFilter').val())">
			<option value="all">Show All</option>
			${
				filters.map(n => `<option value="${n}"><b>${n}</b></option>`).join('')
			}
			</select>
		`, 'nFilter', 'weak-verb')));
		$('.nFilterBtn').css('width', $('.nFilter').css('width'));
	}
	if(ii){
		$('.nFilter').prop('selectedIndex', ii);
		filterMTableRows('mTable', ii, $('.nFilter').val());
	}
}

function showImperativeTable(d, ii) {
	var examples = {
		'I':  
		[
			'قُمۡ   فَأَنذِرۡ  ٢ [74:2]',
			'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ [93:9]',
			'فَقُولِيٓ   إِنِّي   نَذَرۡتُ   لِلرَّحۡمَٰنِ [19:26]',
			'لَا   تَحۡزَنۡ   إِنَّ   ٱللَّهَ   مَعَنَاۖ [9:40]'
		],
		'II': 
		[
			'وَثِيَابَكَ   فَطَهِّرۡ   ٤ [74:4]',
			'فَكُلِي   وَٱشۡرَبِي   وَقَرِّي   عَيۡنٗاۖ  [19:26]',
			'سَلِّمْ على أصدقائِكَ<br/><sup>Greet (Say hello) to your friends</sup>'
		],
		'III':
		[
			'وَلَا تُقَاتِلُوهُمْ عِندَ الْمَسْجِدِ الْحَرَامِ [2:191]',
			'يَٰٓأَيُّهَا   ٱلنَّبِيُّ   جَٰهِدِ   ٱلۡكُفَّارَ   وَٱلۡمُنَٰفِقِينَ [66:9]',
			'قَاتِلْ مِنْ أَجْلِ حُرِّيَّتِكَ<br/><sup>Fight for your freedom</sup>'
		],
		'IV': 
		[
			'وَلَا تُطِعْ كُلَّ حَلَّافٍ مَّهِينٍ [68:10]',
			'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ [5:92]',
			'لَا   تُحِلُّواْ   شَعَٰٓئِرَ   ٱللَّهِ [5:2]'
		],
		'V':  
		[
			'فَتُذَكِّرَ إِحْدَاهُمَا الْأُخْرَىٰ [2:282]',
			'فَتَوَلَّ   عَنۡهُمۡۘ [54:6]',
			'تَعَلَّمْ اللُّغَةَ العَرَبِيَّةَ<br/><sup>Learn the Arabic language</sup>'
		],
		'VI': 
		[
			'وَتَعَاوَنُواْ   عَلَى   ٱلۡبِرِّ   وَٱلتَّقۡوَىٰۖ  [5:2]',
			'إِذَا   تَدَايَنتُم   بِدَيۡنٍ   إِلَىٰٓ   أَجَلٖ   مُّسَمّٗى   فَٱكۡتُبُوهُۚ [2:282]',
			'وَأَشۡهِدُوٓاْ   إِذَا   تَبَايَعۡتُمۡۚ [2:282]'
		],
		'VII':
		[
			'اِنْقَطِعْ عن هذا العادةِ السَّيِّئَةِ<br/><sup>Cut yourself from this bad habbit</sup>',
			'اِنْصَرِفْ إلى عملِكَ<br/><sup>Depart to your work</sup>'
		],
		'VIII':
		[
			'وَلَا تَتَّبِعُوا خُطُوَاتِ الشَّيْطَانِ [2:168]',
			'ثُمَّ   ٱتَّقَواْ   وَّأَحۡسَنُواْۚ [5:93]',
			'اِسْتَمِعْ إِلَى النَّصِيحَةِ<br/><sup>Listen to the advice</sup>'
		],
		'IX': 
		[
			'فَاِخْضَرُّوا يا زَرْعُ<br/><sup>Turn green, O corps!</sup>',
			'اِحْمَرِّي يا وَرْدَةُ<br/><sup>Turn red, O rose!</sup>'
		],
		'X':  
		[
			'وَلَا تَمْنُن تَسْتَكْثِرُ [74:6]',
			'قَالُواْ   يَٰٓأَبَانَا   ٱسۡتَغۡفِرۡ   لَنَا   ذُنُوبَنَآ [12:97]'
		]
	};

	if (d == 1) {
		return examples;
	}
	var container = $(".dictionary");
	var verbInfo = posAPIObj.getVerbInfo();
	var api = this;
	var filters = [];
	container.empty();
	var alink = `<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	var index=0;
	for (const keyVal of Object.entries(verbInfo)) {
		index++;
		var vTable = `
		<table id="mTable${index}" class="mTable">
			<tr>
				<th class="engText" style="font-size: 14px;">Form</th>
				<th class="engText">Gender<br/>M/F</th>
				<th class="engText">2nd Person<br/>مضارع</th>
				<th colspan="2" class="engText">Imperative<br/>الأمر/النهي</th>
			</tr>`;
		var entryName = keyVal[0];
		var xform = keyVal[1];
		if (xform) {
			var pa = xform.filter(x => x.en === "present (active)")
				.map(x => x.form)

			var impM1 = makeImperative(pa[0], 'm');
			var impM2 = impM1.replace(new RegExp("^(ا|([ء-ي]))", "g"), "لا ت$2");

			var impF1 = makeImperative(pa[0], 'f');
			var impF2 = impF1.replace(new RegExp("^(ا|([ء-ي]))", "g"), "لا ت$2");
			var formNumber = entryName.split(' ')[1];
			vTable += `
			<tr>
				<td rowspan="2" class="engText">${formNumber}</td>
				<td class="engText">M</td>
				<td class="engText" style="color:#DD6188">(${make2ndPerson(pa[0], 'm')})</td>
				<td style="color:#7575BB">${impM1}</td>
				<td style="color:#7575BB">${impM2}</td>
			</tr>
			<tr>
				<td class="engText">F</td>
				<td class="engText" style="color:#DD6188">(${make2ndPerson(pa[0], 'f')})</td>
				<td style="color:#7575BB">${impF1}</td>
				<td style="color:#7575BB">${impF2}</td>
			</tr/>
			<tr>
				<td style="background-color:#F6F6BA;font-size:18px;padding:4px;" colspan="5">
					${examples[formNumber].map((ex)=>replaceQLink(ex, false)).join('<br/>')}
				</td>
			</tr>`;
			container.append(vTable);
			//$(`#mTable$${index} tbody`).append($(rows));
			//Add filter
			filters.push(`Imperative - Form ${formNumber}`);
		}
	}
	// Add filter drop down
	if (filters.length > 0) {
		container.prepend($(getListButtinWithSelect(`
			<select class="nFilter" onchange="filterMTableRows('mTable', $('.nFilter').prop('selectedIndex'), $('.nFilter').val())">
			<option value="all">Show All</option>
			${
				filters.map(n => `<option value="${n}"><b>${n}</b></option>`).join('')
			}
			</select>
		`, 'nFilter', 'imp-verb')));
		$('.nFilterBtn').css('width', $('.nFilter').css('width'));
	}
	if(ii){
		$('.nFilter').prop('selectedIndex', ii);
		filterMTableRows('mTable', ii, $('.nFilter').val());
	}

}
