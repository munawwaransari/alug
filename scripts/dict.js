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

			parent.dataCache["API_POS"].data = posAPIObj;

			if (params.action && params.action !== 'cmp') {
				if(posSearchObj){
					handleDictParams();
				}
				else{
					setTimeout(function(){
						handleDictParams();
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
				handleDictParams();
			}
			else{
				setTimeout(function(){
					handleDictParams();
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

	ensureDataLoaded({name: "mappingsData"});
	ensureDataLoaded({name: "ai-prompts"});

	$("#wordSearchText").keyup(function (event) {
		if (event.keyCode === 13) {
			$("#SearchD").click();
		}
	});

	if (isOS('Android')) {
		$("img[src='images/kybd.jpg']").hide();
	}
}

function updateState(key, value) {
	dState[key] = value;
	for (const [k, v] of Object.entries(dState)) {
		$("#" + key + " button").text(v.ar);
		$("#" + key + " button").prop('title', v.en);
	}
}

function updateStateIndex(lst){
	if(lst){
		var st = parent.getStatesFromKey('dict.html');
		if(st.action){
			updateDictStates('dict.html', st.action, `pos:${$(lst).prop('selectedIndex')}`);
		}
	}
}

function updateDictStates(context, a, d){
	var dictState = parent.getStatesFromKey(context);
	a = a=="undefined" ? undefined: a;
	d = d=="undefined" ? undefined: d;
	var action = a!=undefined ? a : dictState["action"];
	var data = a!=undefined ? d : dictState["data"];
	var val = { action: action, data:data };
	parent.updateStatesKey(context, val);
	return val;
}

function selectAndTrigger(data, filterClass) {
	var d = data ? data.toLowerCase() : data;
	if(d && d.startsWith("pos:")){
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
	var i = index < select.options.length ? index : 0;
	$("." + filterClass).val(select.options[i].value);
	$("." + filterClass).trigger('onchange');
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

function loadWord(txt) {
	if(txt && txt !== ''){
		$("#wordSearchText").val(txt);
		analyzeSelectedWord(txt);
	}
	else{
		$(".dictionary").html("No word specified!");
	}
}

function handleDictBack(){
	if(parent){
		var st = parent.getStatesFromKey("dict.html");
		if(st.prevState && st.prevState.length > 0){
			var ps = st.prevState.pop();
			handleDictParams(null, ps.action, ps.data);
		}
	}
}

function postHandleDictParams(el, action){
	if(action && parent.dataCache
		&& parent.dataCache["action-tags"] 
		&& parent.dataCache["action-tags"].data)
	{
		// Update Previous Title button
		var prev = $(".dropbtn.active");
		if(prev.length > 0){
			var prevAction = prev.attr('default_tag');
			if(prevAction){
				var defaultTitle = parent.dataCache["action-tags"].data[prevAction]?.default;
				if(defaultTitle) prev.text(defaultTitle);
			}
			prev.removeClass("active");
			//toggleDropdownContent(prev);
		}

		// Update Current Title button
		var curElement = el ?? $(`[action_tag=${action}]`)[0];
		if(curElement !== undefined){
			var current = $(curElement).parent().prev();
			if(current.prop('tagName') !== 'INPUT'){
				var arTitle = parent.dataCache["action-tags"].data[action]?.ar;
				var enTitle = parent.dataCache["action-tags"].data[action]?.en;
				if(arTitle){
					$(current).addClass("active"); 
					$(current).text(arTitle);
					$(current).attr('title', enTitle);
				}
			}
			toggleDropdownContent(current);		
		}
	}
}

function handleDictParams(el, a, d){
	ensureDataLoaded({name: "action-tags"})
	.then(() => {
		handleDictActions(el || $(`[action_tag=${a}]`)[0], a, d)
	});
}

function handleDictActions(el, a, d) {
	var st = updateDictStates("dict.html", 
							a ?? params["action"], 
							d ?? params["data"]);
	var action = st.action, data = st.data == "undefined" ? undefined : st.data;

	switch (action) {
		case 'defs':	
			if(data){
				listDefinitions(data);
			}
			else{
				listDefinitions();
			}
		break;

		case 'analyze':
		case 'conjugate':
			var word = (!data || data == "" || data == "undefined") ? 
					   $("#wordSearchText").val() ?? $("#wordSearchText").text(): 
			           data.startsWith("pos:") ? undefined: data;
			st.data = word;
			if(action == 'analyze')
				loadWord(word ? word.trim(): undefined);
			else
				analyzeSelectedWordOld(word ? word.trim(): undefined);
			break;

		case 'cause-effect':
			showCauseAndEffects();	
			break;

		case 'noun':
		case 'noun-pat':
			showNounTable();
			if (params["data"]) {
				selectAndTrigger(data, 'nFilter');
			}
			break;

		case 'five-noun':
			showFiveNouns('ism', 'اسماءُ الخَمسة', 'Five Nouns');
			break;

		case 'pronoun':
			showPronounInfo('ism', 'ضَمائر', 'Pronouns');
			var sel = decodeURI(data);
			if (sel) {
				$(".pronounFilter").val(sel == "undefined" ? 'all': sel);
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
				if (data)
					selectAndTrigger(data, 'nFilter');
			});
			break;

		case 'prep':
			setTimeout(function () {
				showParticleTable();
				if (params["data"])
					selectAndTrigger(data, 'nFilter');
			});
			break;

		case 'prep-ph':
			showPrepPhrasesTable();
			if (data && data != '@Key') {
				if (data.startsWith("pos:")) {
					var index = parseInt(data.substring(4));
					setTimeout(function () {
						selectIndexAndTrigger(index, 'nFilter');
					}, 150);
				}
				else{
					var table = $('#pTable:visible');
					const exp = new RegExp("(?:^|[a-z\\s])"+data+"(?:$|[a-z\\s])", 'ig');
					table.find('tr').filter(function (n, el) {
						if (!exp.test($(el).text()))
							$(el).hide();
					});
					$(".nFilter").hide();
				}
			}
			break;

		case 'vtab-all': 
			var pos = 0;
			if (data && data.startsWith("pos:")) {
				pos = parseInt(data.substring(4));
			}			
			showAllVerbTables(pos); 
			break;
		case 'vtab-3': showTriliteralVerbTable(); break;
		case 'vtab-inad': showInadequateVerbTable(); break;
		case 'vtab-weak': showWeakVerbTable(); break;
		case 'vtab-imp': showImperativeTable(); break;
		case 'verb-type':
			setTimeout(function () {
				showObjectEffects('verbTypeData');
				if (data)
					if (data.startsWith("pos:")) {
						var index = parseInt(data.substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(data, 'pronounFilter');
			});
			break;

		case 'masdar':
			setTimeout(function () {
				showObjectEffects('masdarData');
				if (data)
					if (data.startsWith("pos:")) {
						var index = parseInt(data.substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(data, 'pronounFilter');
			});
			break;

		case 'obj-effect':
			setTimeout(function () {
				showObjectEffects('objectEffectsData');
				if (data)
					if (data.startsWith("pos:")) {
						var index = parseInt(data.substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(data, 'pronounFilter');
			});
			break;

		case 'adj':
		case 'adv':
			
			setTimeout(function () {
				showObjectEffects(action == 'adj'? 'adjectiveData': 'adverbData');
				if (data)
					if (data.startsWith("pos:")) {
						var index = parseInt(data.substring(4));
						setTimeout(function () {
							selectIndexAndTrigger(index, 'pronounFilter');
						}, 150);
					}
					else
						selectAndTrigger(data, 'pronounFilter');
			});
			break;

		case 'cmp':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showComparisions(index);
				selectIndexAndTrigger(index, 'nFilter');
			}
			else showComparisions(0);
			break;

		case 'verb-cmp':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showVerbComparisions(index);
			} else {
				showVerbComparisions(0);
			}
			break;
		case 'grammar':
		case 'sen-cmp':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showSentenceComparisions(index, action);
			} else {
				showSentenceComparisions(0, action);
			}
			break;

		case 'noun-cmp':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showNounComparisions(index);
			} else {
				showNounComparisions(0);
			}
			break;

		case 'imp-verb':
			var pos = 0;
			if (data && data.startsWith("pos:")) {
				pos = parseInt(data.substring(4));
			}
			showImperativeTable(null, pos);
			break;

		case 'inad-verb':
			var pos = 0;
			if (data && data.startsWith("pos:")) {
				pos = parseInt(data.substring(4));
			}
			showInadequateVerbTable(null, pos);
			break;

		case 'weak-verb':
			var pos = 0;
			if (data && data.startsWith("pos:")) {
				pos = parseInt(data.substring(4));
			}
			showWeakVerbTable(null, pos);
			break;

		case 'q-examples':
			listExamplesFromQuran();
			toggleDropdownContent($(this).parent().prev());
			break;

		case 'list-search-2':
		case 'list-search':
		default:
			if(data){
				listSearchIndex(data);	
			}else{
				listSearchIndex();
			}
			break;
	}

	postHandleDictParams(el, action);
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

function checkWord(w) {
	$("#wordSearchText").val(w);
}

function analyzeSelectedWord(w) {

	var word = w ?? $("#wordSearchText").val();
	processSelectedWordPos(word.trim(),
	data => {
		var word = data.word;
		if(data.nouns.length > 0){
			//console.log("pos: taking noun");
			word = data.nouns[0];
		}
		else if(data.verbs.length > 0){
			//console.log("pos: taking verb");
			word = data.verbs[0];
		}
		posSearchObj.searchAndAddHtml(word, $(".dictionary"));
	});
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

	var html = '<div style="font-size:12px;text-align:center;">';
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
				style="margin:auto;padding:10px;display:inline-block;">
				<p>${key}
				${getPinIcon(`qid_${kval}`,'',parent.document)}</p>
				${div}
			</div><br/>`;
	});
	html += '</div>';
	dict.append($(html));
}

function loadExamplesFromDefinitions(dict, qselect, data){
	if (data) {
		var examples = data;
		var html = '<div style="font-size:12px;text-align:center;">';
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
					style="margin:auto;padding:10px;display:inline-block;">
					<p>
					${value.name_ar ?? `${key} (${value.en})`}
					${getPinIcon(`qid_${kval}`,'',parent.document)}
					</p>
					${div}
				</div><br/>`;
			}
		});
		html += '</div>';
		dict.append($(html));
	}
}

function loadExamplesFromObjectEffectData(dict, qselect, data) {
	if (data) {
		var examples = data;
		var html = '<div style="font-size:12px;text-align:center;">';
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
					style="margin:auto;padding:10px;display:inline-block;">
					<p>
					${value.name_ar}
					${getPinIcon(`qid_${kval}`,'',parent.document)}
					</p>
					${div}
				</div><br/>`;
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
		var html = '<div style="font-size:12px;text-align:center;">';
		// Display examples
		Object.entries(examples).filter(function ([key, value]) {
			var div = '';
			var values = value.match ? [value] : value;
			values.every(function (ex, i) {
				if (/\[\d+\:\d+\]/ig.test(ex)) {
					div += `<p style="font-size:10px;">${
						replaceQLink(ex+'').replaceAll(']', ']<br/><br/>')
					}</p>`;
				}
				return true;
			});
			
			if (div !== '') {
				var kval = arRemovePunct(prefix + key).replaceAll(' ', '_');
				qselect.append(`<option value="${kval}">${prefix} ${key}</option>`);
				html += `
				<div id="qid_${kval}" 
					style="margin:auto;padding:10px;display:inline-block;">
					<p>
					${prefix} ${key}
					${getPinIcon(`qid_${kval}`,'',parent.document)}
					</p>
				${div}
				</div><br/>`;
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
	var qselect = `
			<select class="qs1" style="text-align:center;"
				onchange=" 
				$('div [id*=qid_]').hide();
				$('div [id*=qid_]').nextAll('br').hide();
				if($(this).val() == 'ALL'){ 
					$('div [id*=qid_]').show()
					$('div [id*=qid_]').nextAll('br').show();
				}else{
					var id = arRemovePunct($(this).val()).replaceAll(' ','_');
					$('div [id=qid_'+id+']').show();
					$('div [id=qid_'+id+']').nextAll('br').show();
				}
				">
				<option value="ALL">ALL</option>
			</select>
			`;
	var qSelectDiv = getListButtinWithSelect(qselect,
		'qs1', '',
		"\"listQListItems('.dictionary', '.qs1')\"");
	dict.append(qSelectDiv);
	qselect = $('.nFilterDiv .qs1');
	var btnDiv = $('.nFilterDiv .nFilterBtn');
	btnDiv.css('width', '280px');

	loadExamplesFromCmpData(dict, qselect);
	ensureDataLoaded({ name: "verb-examples" })
		.then((data) => {
			const exData = Object.fromEntries(
				Object.entries(data).map(([key, value]) => [
					key.replace("V1_", "Trilateral ")
						.replace("V1_", "Quadlateral ")
						.replace("V1_", "Extended"),
					value]
				)
			);
			loadExamplesFromObjectEffectData(dict, qselect, exData);
		});
	ensureDataLoaded({ name: "objectEffectsData" })
		.then((data) => {
			loadExamplesFromObjectEffectData(dict, qselect, data);
		});
	ensureDataLoaded({ name: "adverbData" })
		.then((data) => {
			loadExamplesFromObjectEffectData(dict, qselect, data);
		});
	ensureDataLoaded({ name: "def-data" })
		.then((data) => {
			loadExamplesFromDefinitions(dict, qselect, data);
		});
	loadExamplesFromData(dict, qselect, showImperativeTable(1), "Imperative - Form");
	loadExamplesFromData(dict, qselect, showWeakVerbTable(1), "Weak Verbs");
	loadExamplesFromData(dict, qselect, showInadequateVerbTable(1), "Inadequate Verbs");
	loadExamplesFromData(dict, qselect, get_ce_examples());
	if (posAPIObj)
		loadExamplesFromData(dict, qselect, posAPIObj.getMetonymies(1));

	if (selText) {
		setTimeout(function () {
			$(".qs1").val(selText);
			if ($(".qs1").val() !== '') {
				$(".qs1").trigger('change');
			}
		}, 40);
	}
}

function listDefinitions(bk){
	var container = $(".dictionary");
	ensureDataLoaded({name:'def-data'})
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
				if(bk.startsWith("pos")){
					var index = parseInt(bk.split(":")[1]);
					defSelect.find(`option:eq(${index})`).prop('selected', true);
					defSelect.trigger('change');
				}else{
					var bkId = bk.startsWith("#") ? bk : `#bm_${bk}`;
					window.open(bkId, '_self');
				}
			}
	});
}

function listSearchIndex(indexKey='') {
	ensureDataLoaded({name:'isearchData'})
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
					<option value="sen-cmp">Sentence Comparison</option>
					<option value="noun-cmp">Noun Comparison</option>
					<option value="noun-pat">Noun Patternns</option>
					<option value="masdar">Verbal Noun</option>
					<option value="adj">Adjective</option>
					<option value="adv">Adverb</option>
					<option value="pronoun">Pronoun</option>
					<option value="prep">Preposition</option>
					<option value="grammar">Grammar</option>
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
		case 'sen-cmp':
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

function loadComparision() {
	var comppSel = $("select option[class='.cmpVerb']");
	var verbCompare = comppSel.length > 0 ? comppSel.val() : '';
	cmpAPIObj.addComparisionTable(".dictionary", $(".dictionary select").val(), verbCompare);
}